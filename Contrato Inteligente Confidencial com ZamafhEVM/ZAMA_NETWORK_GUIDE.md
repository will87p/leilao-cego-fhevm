# 🌐 Guia para Rodar na Rede Zama

## 📋 Visão Geral

Este guia explica como configurar e executar o projeto de leilão cego confidencial na rede oficial da Zama, utilizando a versão mais recente do FHEVM (v0.7.0).

## 🔄 Atualizações Implementadas

O projeto foi atualizado para usar a nova API do FHEVM v0.7.0 <mcreference link="https://docs.zama.ai/protocol/solidity-guides/development-guide/migration" index="0">0</mcreference>:

### Principais Mudanças:
- ✅ **Biblioteca**: `TFHE` → `FHE`
- ✅ **Pacote**: `fhevm` → `@fhevm/solidity`
- ✅ **Configuração**: `SepoliaZamaConfig` → `SepoliaConfig`
- ✅ **Gateway**: Removido `GatewayCaller`, usando `FHE.requestDecryption`
- ✅ **Callbacks**: Nova estrutura com `bytes memory cleartexts`
- ✅ **HCU Limits**: Substituição do gas limit por HCU (Homomorphic Complexity Unit)

## 🛠️ Configuração Inicial

### 1. Atualizar Dependências

```bash
# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Instalar novas dependências
npm install

# Verificar instalação
npm list @fhevm/solidity
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# Chave privada (sem 0x)
PRIVATE_KEY=sua_chave_privada_aqui

# Rede Zama Devnet
ZAMA_RPC_URL=https://devnet.zama.ai
ZAMA_CHAIN_ID=8009

# Gateway e Coprocessor
ZAMA_GATEWAY_URL=https://gateway.devnet.zama.ai
ZAMA_COPROCESSOR_URL=https://coprocessor.devnet.zama.ai

# Endereços do sistema (Devnet)
ACL_ADDRESS=0x687820221192C5B662b25367F70076A37bc79b6c
COPROCESSOR_ADDRESS=0x848B0066793BcC60346Da1F49049357399B8D595
DECRYPTION_ORACLE_ADDRESS=0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
KMS_VERIFIER_ADDRESS=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
```

### 3. Atualizar Configuração Hardhat

Edite `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Rede Zama Devnet
    zama: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
      timeout: 120000, // 2 minutos
      gas: "auto",
      gasPrice: "auto",
    },
  },
  mocha: {
    timeout: 120000, // 2 minutos para testes
  },
};
```

## 💰 Obter Tokens de Teste

### Faucet Zama

1. **Acesse**: [https://faucet.zama.ai](https://faucet.zama.ai)
2. **Cole seu endereço**: Endereço da carteira
3. **Solicite tokens**: Clique em "Request tokens"
4. **Aguarde**: Confirmação na blockchain

### Verificar Saldo

```bash
# Script para verificar saldo
cat > scripts/check-balance.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("🏦 Informações da Carteira:");
  console.log(`📍 Endereço: ${address}`);
  console.log(`💰 Saldo: ${ethers.formatEther(balance)} ETH`);
  
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Rede: ${network.name} (Chain ID: ${network.chainId})`);
}

main().catch(console.error);
EOF

# Executar verificação
npx hardhat run scripts/check-balance.js --network zama
```

## 🚀 Implantação na Rede Zama

### 1. Compilar Contratos

```bash
# Limpar cache
npx hardhat clean

# Compilar com nova versão
npx hardhat compile

# Verificar se compilou sem erros
echo "✅ Compilação concluída!"
```

### 2. Executar Testes (Opcional)

```bash
# Testes locais primeiro
npx hardhat test

# Se tudo estiver funcionando, prosseguir
```

### 3. Implantar na Rede Zama

```bash
# Verificar saldo antes
npx hardhat run scripts/check-balance.js --network zama

# Implantar contrato
npx hardhat run scripts/deploy.js --network zama

# Exemplo de saída esperada:
# 🚀 Iniciando implantação do contrato BlindAuction...
# 📝 Implantando com a conta: 0x...
# 💰 Balance da conta: 1.0 ETH
# ✅ Contrato implantado com sucesso!
# 📍 Endereço do contrato: 0x...
```

### 4. Salvar Endereço do Contrato

```bash
# Definir variável de ambiente
export CONTRACT_ADDRESS="0x..."  # Substitua pelo endereço real

# Ou adicionar ao .env
echo "CONTRACT_ADDRESS=0x..." >> .env
```

## 🧪 Testando na Rede Zama

### 1. Interação Básica

```bash
# Definir endereço do contrato
export CONTRACT_ADDRESS="0x..."

# Executar script de interação
npx hardhat run scripts/interact.js --network zama
```

### 2. Fazer Lances Criptografados

Crie um script de teste específico:

```bash
cat > scripts/test-zama.js << 'EOF'
const { ethers } = require("hardhat");
const { createInstance } = require("../utils/instance");
const { getSigners } = require("../utils/signers");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.log("❌ Defina CONTRACT_ADDRESS no .env");
    return;
  }
  
  console.log("🔗 Testando na Rede Zama:", contractAddress);
  
  // Obter signers
  const signers = await getSigners();
  const { alice, bob, carol } = signers;
  
  // Conectar ao contrato
  const BlindAuction = await ethers.getContractFactory("BlindAuction");
  const contract = BlindAuction.attach(contractAddress);
  
  // Verificar se leilão está ativo
  const isActive = await contract.isAuctionActive();
  console.log("🔄 Leilão ativo:", isActive);
  
  if (!isActive) {
    console.log("⚠️ Leilão não está ativo");
    return;
  }
  
  // Criar instâncias FHEVM
  console.log("🔐 Criando instâncias FHEVM...");
  const instanceBob = await createInstance(contractAddress, ethers, bob);
  const instanceCarol = await createInstance(contractAddress, ethers, carol);
  
  try {
    // Lance do Bob: 1000
    console.log("💰 Bob fazendo lance de 1000...");
    const bobBid = instanceBob.encrypt64(1000);
    const tx1 = await contract.connect(bob).placeBid(bobBid, {
      gasLimit: 5000000 // HCU limit
    });
    await tx1.wait();
    console.log("✅ Lance do Bob confirmado");
    
    // Lance da Carol: 1500
    console.log("💰 Carol fazendo lance de 1500...");
    const carolBid = instanceCarol.encrypt64(1500);
    const tx2 = await contract.connect(carol).placeBid(carolBid, {
      gasLimit: 5000000
    });
    await tx2.wait();
    console.log("✅ Lance da Carol confirmado");
    
    // Verificar licitantes
    const bidders = await contract.getBidders();
    console.log("👥 Total de licitantes:", bidders.length);
    
    console.log("🎉 Teste na rede Zama concluído com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante o teste:", error.message);
  }
}

main().catch(console.error);
EOF

# Executar teste
npx hardhat run scripts/test-zama.js --network zama
```

## 🏁 Finalização na Rede Zama

### 1. Finalizar Leilão

```bash
# Finalizar leilão
npx hardhat run scripts/finalize.js --network zama
```

### 2. Monitorar Descriptografia

A descriptografia na rede Zama pode levar alguns minutos:

```bash
# Script de monitoramento
cat > scripts/monitor-zama.js << 'EOF'
const { ethers } = require("hardhat");

async function monitor() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const BlindAuction = await ethers.getContractFactory("BlindAuction");
  const contract = BlindAuction.attach(contractAddress);
  
  console.log("🔍 Monitorando leilão na rede Zama...");
  console.log("📍 Contrato:", contractAddress);
  
  const checkStatus = async () => {
    try {
      const info = await contract.getAuctionInfo();
      const isActive = await contract.isAuctionActive();
      
      console.log(`\n⏰ ${new Date().toLocaleTimeString()}`);
      console.log(`🔄 Ativo: ${isActive ? '✅' : '❌'}`);
      console.log(`🏁 Finalizado: ${info[3] ? '✅' : '❌'}`);
      console.log(`🏆 Vencedor revelado: ${info[4] ? '✅' : '❌'}`);
      console.log(`👥 Licitantes: ${info[5]}`);
      
      if (info[4]) {
        const winner = await contract.winner();
        const winningBid = await contract.winningBid();
        console.log(`🥇 Vencedor: ${winner}`);
        console.log(`💰 Lance vencedor: ${winningBid}`);
        console.log("\n🎉 Leilão concluído!");
        process.exit(0);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  };
  
  // Verificar a cada 30 segundos
  setInterval(checkStatus, 30000);
  checkStatus(); // Primeira verificação imediata
}

monitor().catch(console.error);
EOF

# Executar monitoramento
npx hardhat run scripts/monitor-zama.js --network zama
```

## 📊 Limites e Considerações

### HCU (Homomorphic Complexity Unit) Limits <mcreference link="https://docs.zama.ai/protocol/solidity-guides/development-guide/migration" index="0">0</mcreference>

O FHEVM v0.7.0 introduziu limites HCU:

- **Sequential operations**: 5,000,000 HCU por transação
- **Global operations**: 20,000,000 HCU por transação

### Operações e Custos HCU

| Operação | HCU Aproximado | Descrição |
|----------|----------------|----------|
| `FHE.add()` | ~50,000 | Adição criptografada |
| `FHE.gt()` | ~70,000 | Comparação maior que |
| `FHE.select()` | ~80,000 | Seleção condicional |
| `FHE.decrypt()` | ~100,000 | Descriptografia local |
| `FHE.requestDecryption()` | ~150,000 | Solicitação ao oracle |

### Otimizações

```solidity
// ✅ Eficiente - combinar operações
ebool isValidAndHigher = FHE.and(
    FHE.gt(bidAmount, FHE.asEuint64(0)),
    FHE.gt(bidAmount, highestBid)
);

// ❌ Ineficiente - operações separadas
ebool isValid = FHE.gt(bidAmount, FHE.asEuint64(0));
ebool isHigher = FHE.gt(bidAmount, highestBid);
```

## 🔧 Troubleshooting

### Problemas Comuns

**Erro: "HCU limit exceeded"**
```bash
# Solução: Reduzir complexidade ou dividir em múltiplas transações
# Aumentar gasLimit se necessário
```

**Erro: "Coprocessor not configured"**
```solidity
// Verificar se o construtor tem:
FHE.setCoprocessor(SepoliaConfig.getSepoliaConfig());
```

**Erro: "Invalid signature"**
```bash
# Verificar se está usando a rede correta
# Confirmar endereços do sistema no .env
```

**Descriptografia lenta**
```bash
# Normal na rede Zama - pode levar 2-5 minutos
# Use o script de monitoramento para acompanhar
```

## 📋 Checklist de Implantação Zama

- [ ] Dependências atualizadas para v0.7.0
- [ ] Contratos compilando sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Tokens obtidos do faucet
- [ ] Saldo verificado (>0.1 ETH recomendado)
- [ ] Contrato implantado com sucesso
- [ ] Endereço do contrato salvo
- [ ] Testes de interação funcionando
- [ ] Monitoramento configurado

## 🎯 Próximos Passos

1. **Monitorar Performance**: Acompanhar uso de HCU
2. **Otimizar Operações**: Reduzir complexidade quando possível
3. **Documentar Resultados**: Registrar tempos de descriptografia
4. **Testar Edge Cases**: Cenários com muitos licitantes
5. **Preparar para Mainnet**: Quando disponível

---

**🌐 Rede Zama Devnet**
- **RPC**: https://devnet.zama.ai
- **Chain ID**: 8009
- **Explorer**: Em desenvolvimento
- **Faucet**: https://faucet.zama.ai

**⚠️ Nota**: A rede Zama está em desenvolvimento ativo. Algumas funcionalidades podem mudar entre versões.