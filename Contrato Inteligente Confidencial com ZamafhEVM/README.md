# 🔐 Leilão Cego Confidencial com Zama FHEVM

## 📋 Visão Geral

Este projeto implementa um contrato inteligente de **leilão cego confidencial** utilizando a tecnologia **Zama FHEVM** (Fully Homomorphic Encryption for EVM). O objetivo principal é garantir que os lances dos participantes permaneçam privados e criptografados durante todo o processo do leilão, sendo revelados apenas ao final para determinar o vencedor.

### 🎯 Características Principais

- **Privacidade Total**: Lances permanecem criptografados na blockchain
- **Comparação Segura**: Determinação do vencedor sem descriptografar lances
- **Transparência Seletiva**: Apenas o resultado final é revelado
- **Segurança Criptográfica**: Utiliza criptografia homomórfica completa

## 🛠️ Tecnologias Utilizadas

- **Blockchain**: EVM compatível (Sepolia, FHEVM Devnet)
- **Framework**: Zama FHEVM v0.4.0
- **Linguagem**: Solidity ^0.8.24
- **Ferramentas**: Hardhat, fhevmjs
- **Testes**: Mocha/Chai com suporte FHEVM

## 📁 Estrutura do Projeto

```
Contrato Inteligente Confidencial com ZamafhEVM/
├── contracts/
│   ├── BlindAuction.sol      # Contrato principal do leilão
│   └── FHEVMConfig.sol       # Configurações FHEVM
├── scripts/
│   ├── deploy.js             # Script de implantação
│   ├── interact.js           # Script de interação
│   └── finalize.js           # Script de finalização
├── test/
│   └── BlindAuction.test.js  # Testes unitários
├── utils/
│   ├── instance.js           # Utilitários FHEVM
│   └── signers.js            # Gerenciamento de signers
├── hardhat.config.js         # Configuração Hardhat
├── package.json              # Dependências do projeto
└── .env.example              # Variáveis de ambiente
```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js v18+ 
- npm ou yarn
- Carteira com ETH para implantação

### 2. Instalação

```bash
# Clonar ou baixar o projeto
cd "Contrato Inteligente Confidencial com ZamafhEVM"

# Instalar dependências
npm install
```

### 3. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
# - PRIVATE_KEY: Sua chave privada (sem 0x)
# - SEPOLIA_RPC_URL: URL do provedor Sepolia
# - FHEVM_RPC_URL: URL da rede FHEVM
```

### 4. Compilação

```bash
npm run compile
```

## 📖 Como Usar

### 1. Implantação do Contrato

```bash
# Implantar na rede local
npx hardhat run scripts/deploy.js --network hardhat

# Implantar na Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Implantar na FHEVM Devnet
npx hardhat run scripts/deploy.js --network fhevm
```

### 2. Interação com o Contrato

```bash
# Definir endereço do contrato
export CONTRACT_ADDRESS="0x..."

# Fazer lances e interagir
npx hardhat run scripts/interact.js --network <rede>

# Finalizar leilão
npx hardhat run scripts/finalize.js --network <rede>
```

### 3. Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npx hardhat test test/BlindAuction.test.js
```

## 🔧 Funcionalidades do Contrato

### Principais Funções

#### `placeBid(inEuint64 encryptedBid)`
- **Descrição**: Permite fazer um lance criptografado
- **Parâmetros**: Lance criptografado usando TFHE
- **Restrições**: Apenas durante leilão ativo, lance > 0

#### `endAuction()`
- **Descrição**: Finaliza o leilão
- **Permissões**: Leiloeiro ou após tempo limite
- **Efeito**: Para novos lances

#### `revealWinner()`
- **Descrição**: Revela o vencedor do leilão
- **Permissões**: Apenas leiloeiro
- **Processo**: Solicita descriptografia via gateway

#### `getAuctionInfo()`
- **Descrição**: Retorna informações públicas do leilão
- **Retorno**: Leiloeiro, item, tempos, status, total de licitantes

### Eventos

- `BidPlaced(address bidder, bytes32 bidHash)`: Lance registrado
- `AuctionEnded(uint256 endTime)`: Leilão finalizado
- `WinnerRevealed(address winner, uint256 amount)`: Vencedor revelado

## 🔐 Aspectos de Segurança

### Criptografia Homomórfica

- **Tipos Criptografados**: `euint64` para valores, `ebool` para comparações
- **Operações FHE**: `TFHE.gt()`, `TFHE.select()`, `TFHE.decrypt()`
- **Controle de Acesso**: ACL gerencia permissões de descriptografia

### Medidas de Segurança

- ✅ Validação de lances (> 0)
- ✅ Controle de tempo do leilão
- ✅ Permissões de leiloeiro
- ✅ Prevenção de reentrância
- ✅ Função de emergência

## 🧪 Testes

O projeto inclui testes abrangentes cobrindo:

- ✅ Implantação e inicialização
- ✅ Fazer lances válidos e inválidos
- ✅ Múltiplos licitantes
- ✅ Finalização do leilão
- ✅ Revelação do vencedor
- ✅ Funções de emergência
- ✅ Controles de acesso

```bash
# Executar testes com cobertura
npx hardhat test --verbose
```

## 🌐 Redes Suportadas

### FHEVM Devnet
- **Chain ID**: 8009
- **RPC**: https://devnet.zama.ai
- **Gateway**: https://gateway.devnet.zama.ai

### Sepolia (com FHEVM)
- **Chain ID**: 11155111
- **RPC**: Infura/Alchemy
- **Configuração**: Requer setup FHEVM

### Local (Hardhat)
- **Chain ID**: 1337
- **RPC**: http://localhost:8545
- **Uso**: Desenvolvimento e testes

## 📊 Exemplo de Uso

### Cenário: Leilão de Arte Digital

1. **Criação**: Leiloeiro implanta contrato para "Obra de Arte Digital"
2. **Lances**: 
   - Alice: 1000 ETH (criptografado)
   - Bob: 1500 ETH (criptografado)
   - Carol: 800 ETH (criptografado)
3. **Finalização**: Leiloeiro encerra após 24h
4. **Revelação**: Gateway descriptografa e revela Bob como vencedor
5. **Resultado**: Bob ganha com 1500 ETH

### Código de Exemplo

```javascript
// Criar instância FHEVM
const instance = await createInstance(contractAddress, ethers, signer);

// Criptografar lance
const encryptedBid = instance.encrypt64(1500);

// Fazer lance
await blindAuction.placeBid(encryptedBid);

// Finalizar leilão (apenas leiloeiro)
await blindAuction.endAuction();

// Revelar vencedor (apenas leiloeiro)
await blindAuction.revealWinner();
```

## 🔍 Troubleshooting

### Problemas Comuns

**Erro: "Lance deve ser maior que zero"**
- Verifique se o valor criptografado é > 0
- Confirme a criptografia correta com FHEVM

**Erro: "Leilão já terminou"**
- Verifique o tempo atual vs. `auctionEndTime`
- Confirme se `auctionEnded` é false

**Erro: "Apenas o leiloeiro pode executar"**
- Use a conta que implantou o contrato
- Verifique `msg.sender == auctioneer`

**Gateway não responde**
- Verifique conectividade com gateway FHEVM
- Confirme configuração de rede correta

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- **Zama**: Pela tecnologia FHEVM inovadora
- **Ethereum**: Pela plataforma blockchain
- **OpenZeppelin**: Pelas bibliotecas de segurança
- **Hardhat**: Pelo framework de desenvolvimento

## 📞 Suporte

Para dúvidas ou suporte:

- 📧 Email: [seu-email@exemplo.com]
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Zama FHEVM Documentation]

---

**⚠️ Aviso**: Este é um projeto educacional/demonstrativo. Para uso em produção, realize auditoria de segurança completa.