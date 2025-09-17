# 🔐 Guia Técnico FHEVM - Leilão Cego Confidencial

## 📚 Introdução ao FHEVM

**FHEVM** (Fully Homomorphic Encryption for EVM) é uma tecnologia revolucionária desenvolvida pela Zama que permite executar computações sobre dados criptografados diretamente na blockchain, sem nunca revelar os dados originais.

### 🎯 Benefícios Principais

- **Privacidade Nativa**: Dados permanecem criptografados on-chain
- **Computação Confidencial**: Operações sobre dados criptografados
- **Compatibilidade EVM**: Funciona com infraestrutura Ethereum existente
- **Transparência Seletiva**: Revelação controlada de resultados

## 🏗️ Arquitetura FHEVM

### Componentes Principais

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   dApp/Client   │    │   Blockchain    │    │   Gateway       │
│                 │    │                 │    │                 │
│ • Criptografia  │◄──►│ • Contratos     │◄──►│ • Descriptografia│
│ • Interface     │    │ • Ciphertexts   │    │ • KMS           │
│ • fhevmjs       │    │ • Computação    │    │ • Relayer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Fluxo de Dados

1. **Cliente**: Criptografa dados com chave pública
2. **Blockchain**: Armazena e computa sobre ciphertexts
3. **Gateway**: Descriptografa resultados quando autorizado
4. **Callback**: Retorna resultados descriptografados ao contrato

## 🔢 Tipos de Dados FHEVM

### Tipos Criptografados Suportados

| Tipo Solidity | Tipo FHEVM | Descrição | Uso no Projeto |
|---------------|------------|-----------|----------------|
| `uint8` | `euint8` | 8-bit unsigned | Flags, status |
| `uint16` | `euint16` | 16-bit unsigned | IDs pequenos |
| `uint32` | `euint32` | 32-bit unsigned | Timestamps |
| `uint64` | `euint64` | 64-bit unsigned | **Valores de lances** |
| `bool` | `ebool` | Boolean | Comparações |
| `address` | `eaddress` | Endereço Ethereum | Endereços privados |

### Exemplo de Uso no Contrato

```solidity
// Declaração de variáveis criptografadas
euint64 private highestBid;        // Lance mais alto (privado)
ebool private isValidBid;          // Resultado de validação
eaddress private winnerAddress;    // Endereço do vencedor (privado)

// Estrutura com dados criptografados
struct Bid {
    euint64 amount;     // Valor criptografado
    address bidder;     // Endereço público
    bool exists;        // Flag pública
}
```

## 🛠️ Operações FHEVM

### Operações Aritméticas

```solidity
// Adição
euint64 sum = TFHE.add(a, b);

// Subtração
euint64 diff = TFHE.sub(a, b);

// Multiplicação
euint64 product = TFHE.mul(a, b);

// Divisão (limitada)
euint64 quotient = TFHE.div(a, plaintext_b);
```

### Operações de Comparação

```solidity
// Maior que
ebool isGreater = TFHE.gt(bidAmount, highestBid);

// Menor que
ebool isLess = TFHE.lt(bidAmount, maxBid);

// Igual
ebool isEqual = TFHE.eq(bidAmount, targetAmount);

// Maior ou igual
ebool isGreaterEqual = TFHE.gte(bidAmount, minBid);
```

### Operações Condicionais

```solidity
// Seleção condicional (ternário criptografado)
euint64 newHighest = TFHE.select(
    TFHE.gt(newBid, currentHighest),  // condição
    newBid,                           // se verdadeiro
    currentHighest                    // se falso
);

// Exemplo no nosso contrato
highestBid = TFHE.select(isHigherBid, bidAmount, highestBid);
```

## 🔐 Controle de Acesso (ACL)

### Sistema de Permissões

O FHEVM usa um sistema de **Access Control List (ACL)** para gerenciar quem pode acessar dados criptografados:

```solidity
// Permitir que o contrato acesse o ciphertext
TFHE.allowThis(encryptedValue);

// Permitir que um endereço específico acesse
TFHE.allow(encryptedValue, authorizedAddress);

// Permitir que múltiplos endereços acessem
TFHE.allowTransient(encryptedValue, [addr1, addr2]);
```

### Implementação no Leilão

```solidity
function placeBid(inEuint64 calldata encryptedBid) external {
    euint64 bidAmount = TFHE.asEuint64(encryptedBid);
    
    // Permitir que o contrato acesse o lance
    TFHE.allowThis(bidAmount);
    
    // Armazenar o lance
    bids[msg.sender] = Bid({
        amount: bidAmount,
        bidder: msg.sender,
        exists: true
    });
}
```

## 🌐 Gateway e Descriptografia

### Processo de Descriptografia

1. **Solicitação**: Contrato solicita descriptografia
2. **Validação**: Gateway verifica permissões ACL
3. **Processamento**: KMS descriptografa o valor
4. **Callback**: Resultado retornado ao contrato

### Implementação no Contrato

```solidity
function revealWinner() external onlyAuctioneer {
    // Preparar array de ciphertexts para descriptografar
    uint256[] memory cts = new uint256[](1);
    cts[0] = Gateway.toUint256(highestBid);
    
    // Solicitar descriptografia
    Gateway.requestDecryption(
        cts,                                    // ciphertexts
        this.callbackRevealWinner.selector,    // função callback
        0,                                      // gas limit (0 = auto)
        block.timestamp + 100,                 // deadline
        false                                   // não é async
    );
}

// Callback processado pelo gateway
function callbackRevealWinner(
    uint256 /*requestId*/,
    uint256 decryptedValue
) external onlyGateway {
    winner = currentWinner;
    winningBid = decryptedValue;
    winnerRevealed = true;
    
    emit WinnerRevealed(winner, winningBid);
}
```

## 💻 Integração Client-Side

### Usando fhevmjs

```javascript
const { FhevmInstance } = require("fhevmjs");

// Criar instância FHEVM
const instance = await FhevmInstance.create({
    chainId: 8009,
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
    aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92"
});

// Gerar keypair
instance.generateKeypair();

// Criptografar valor
const encryptedBid = instance.encrypt64(1500);

// Enviar transação
const tx = await contract.placeBid(encryptedBid);
```

### Descriptografia Client-Side

```javascript
// Reencriptar para o cliente (se autorizado)
const reencryptedValue = await instance.reencrypt(
    ciphertext,
    contractAddress,
    userAddress
);

// Descriptografar localmente
const decryptedValue = instance.decrypt(contractAddress, reencryptedValue);
```

## 🔧 Configuração de Rede

### FHEVM Devnet

```javascript
// hardhat.config.js
fhevm: {
    url: "https://devnet.zama.ai",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 8009,
}
```

### Endereços de Sistema

```solidity
// Endereços padrão FHEVM Devnet
address constant ACL_ADDRESS = 0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92;
address constant TFHE_EXECUTOR = 0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c;
address constant FHE_PAYMENT = 0xFb03BE574d14C256D56F09a198B586bdfc0A9de2;
address constant KMS_VERIFIER = 0x9D6891A6240D6130c54ae243d8005063D05fE14b;
```

## ⚡ Otimizações e Melhores Práticas

### Performance

1. **Minimize Operações FHE**: Operações criptográficas são custosas
2. **Batch Operations**: Agrupe operações quando possível
3. **Cache Results**: Evite recálculos desnecessários
4. **Selective Decryption**: Descriptografe apenas quando necessário

### Segurança

1. **Validate Inputs**: Sempre valide dados de entrada
2. **Access Control**: Use ACL rigorosamente
3. **Time Bounds**: Implemente timeouts para operações
4. **Emergency Stops**: Tenha mecanismos de parada de emergência

### Exemplo Otimizado

```solidity
// ❌ Ineficiente - múltiplas comparações
function inefficientBidding(inEuint64 calldata bid) external {
    euint64 bidAmount = TFHE.asEuint64(bid);
    
    require(TFHE.decrypt(TFHE.gt(bidAmount, TFHE.asEuint64(0))));
    require(TFHE.decrypt(TFHE.lt(bidAmount, TFHE.asEuint64(maxBid))));
    require(TFHE.decrypt(TFHE.gt(bidAmount, highestBid)));
}

// ✅ Eficiente - validações combinadas
function efficientBidding(inEuint64 calldata bid) external {
    euint64 bidAmount = TFHE.asEuint64(bid);
    
    // Combinar validações em uma operação
    ebool isValid = TFHE.and(
        TFHE.gt(bidAmount, TFHE.asEuint64(0)),
        TFHE.and(
            TFHE.lt(bidAmount, TFHE.asEuint64(maxBid)),
            TFHE.gt(bidAmount, highestBid)
        )
    );
    
    require(TFHE.decrypt(isValid), "Lance invalido");
}
```

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

**Erro: "ACL not authorized"**
```solidity
// Solução: Adicionar permissão ACL
TFHE.allowThis(ciphertext);
```

**Erro: "Gateway timeout"**
```javascript
// Solução: Aumentar timeout
Gateway.requestDecryption(
    cts,
    callback,
    0,
    block.timestamp + 300, // Aumentar deadline
    false
);
```

**Erro: "Invalid ciphertext"**
```javascript
// Solução: Verificar criptografia client-side
const encrypted = instance.encrypt64(value);
// Verificar se value > 0 e dentro dos limites
```

### Ferramentas de Debug

```solidity
// Logging para desenvolvimento
event DebugBid(address bidder, bytes32 ciphertextHash);

function placeBid(inEuint64 calldata encryptedBid) external {
    euint64 bidAmount = TFHE.asEuint64(encryptedBid);
    
    // Log para debug (não revela valor)
    emit DebugBid(msg.sender, keccak256(abi.encode(bidAmount)));
    
    // ... resto da lógica
}
```

## 📊 Métricas e Monitoramento

### Gas Costs

| Operação | Gas Estimado | Descrição |
|----------|--------------|----------|
| `TFHE.add()` | ~50,000 | Adição FHE |
| `TFHE.gt()` | ~70,000 | Comparação FHE |
| `TFHE.select()` | ~80,000 | Seleção condicional |
| `TFHE.decrypt()` | ~100,000 | Descriptografia |
| `Gateway.requestDecryption()` | ~150,000 | Solicitação ao gateway |

### Monitoramento

```javascript
// Monitorar eventos do contrato
contract.on("BidPlaced", (bidder, bidHash) => {
    console.log(`Novo lance de ${bidder}: ${bidHash}`);
});

contract.on("WinnerRevealed", (winner, amount) => {
    console.log(`Vencedor: ${winner} com lance de ${amount}`);
});
```

## 🔮 Casos de Uso Avançados

### Leilão com Reserva Secreta

```solidity
euint64 private reservePrice; // Preço de reserva secreto

function checkReservePrice() internal view returns (ebool) {
    return TFHE.gte(highestBid, reservePrice);
}
```

### Múltiplos Itens

```solidity
mapping(uint256 => euint64) private itemHighestBids;
mapping(uint256 => address) private itemWinners;

function placeBidForItem(
    uint256 itemId,
    inEuint64 calldata encryptedBid
) external {
    // Lógica para lances em itens específicos
}
```

### Leilão Holandês Confidencial

```solidity
euint64 private currentPrice;
uint256 private priceDecrement;

function updatePrice() internal {
    // Reduzir preço ao longo do tempo
    currentPrice = TFHE.sub(currentPrice, TFHE.asEuint64(priceDecrement));
}
```

---

**📚 Recursos Adicionais**

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [TFHE Library Reference](https://docs.zama.ai/fhevm/fundamentals/types)
- [fhevmjs SDK](https://docs.zama.ai/fhevm/getting_started/connect)
- [FHEVM Examples](https://github.com/zama-ai/fhevm)

**⚠️ Nota**: Esta é uma tecnologia em desenvolvimento. Sempre teste extensivamente antes de usar em produção.