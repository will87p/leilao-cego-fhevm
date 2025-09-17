# 🚀 Guia de Implantação - Leilão Cego FHEVM

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Node.js**: v18.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **Git**: Para controle de versão
- **Carteira**: Com ETH para gas fees

### Conhecimentos Necessários
- Solidity básico
- Conceitos de blockchain
- Linha de comando
- Criptografia (conceitos básicos)

## 🛠️ Configuração Inicial

### 1. Preparação do Ambiente

```bash
# Verificar versões
node --version  # Deve ser v18+
npm --version   # Deve ser v8+

# Navegar para o diretório do projeto
cd "Contrato Inteligente Confidencial com ZamafhEVM"

# Instalar dependências
npm install

# Verificar instalação
npx hardhat --version
```

### 2. Configuração de Carteira

#### Opção A: MetaMask
1. Instale a extensão MetaMask
2. Crie ou importe uma carteira
3. Exporte a chave privada (Settings > Security & Privacy > Export Private Key)
4. **⚠️ NUNCA compartilhe sua chave privada!**

#### Opção B: Hardhat Accounts
```bash
# Gerar nova carteira
npx hardhat accounts

# Usar conta local (apenas para desenvolvimento)
# As contas locais já têm ETH para testes
```

### 3. Configuração de Rede

#### Arquivo .env
```bash
# Copiar template
cp .env.example .env

# Editar .env
nano .env  # ou use seu editor preferido
```

#### Configurações por Rede

**Para FHEVM Devnet:**
```env
PRIVATE_KEY=sua_chave_privada_sem_0x
FHEVM_RPC_URL=https://devnet.zama.ai
FHEVM_GATEWAY_URL=https://gateway.devnet.zama.ai
```

**Para Sepolia:**
```env
PRIVATE_KEY=sua_chave_privada_sem_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_PROJECT_ID
INFURA_API_KEY=seu_project_id_infura
```

**Para Desenvolvimento Local:**
```env
# Usar contas padrão do Hardhat
# Não precisa configurar chaves
```

## 🌐 Opções de Implantação

### Opção 1: Rede Local (Recomendado para Testes)

```bash
# Terminal 1: Iniciar rede local
npx hardhat node

# Terminal 2: Implantar contrato
npx hardhat run scripts/deploy.js --network hardhat

# Resultado esperado:
# ✅ Contrato implantado com sucesso!
# 📍 Endereço do contrato: 0x...
```

**Vantagens:**
- ✅ Rápido e gratuito
- ✅ Controle total
- ✅ Ideal para desenvolvimento
- ✅ Reset fácil

**Limitações:**
- ❌ Não é FHEVM real
- ❌ Funcionalidades FHE simuladas

### Opção 2: FHEVM Devnet (Recomendado para FHEVM)

```bash
# Verificar saldo (precisa de ETH de teste)
npx hardhat run scripts/check-balance.js --network fhevm

# Implantar
npx hardhat run scripts/deploy.js --network fhevm

# Verificar implantação
npx hardhat run scripts/verify-deployment.js --network fhevm
```

**Como obter ETH de teste:**
1. Acesse [Zama Faucet](https://faucet.zama.ai)
2. Cole seu endereço
3. Solicite tokens de teste
4. Aguarde confirmação

**Vantagens:**
- ✅ FHEVM completo
- ✅ Gateway real
- ✅ Criptografia real
- ✅ Ambiente de teste oficial

### Opção 3: Sepolia (Para Testes Ethereum)

```bash
# Obter ETH de teste
# Visite: https://sepoliafaucet.com

# Verificar saldo
npx hardhat run scripts/check-balance.js --network sepolia

# Implantar
npx hardhat run scripts/deploy.js --network sepolia
```

**Vantagens:**
- ✅ Rede Ethereum real
- ✅ Ferramentas maduras
- ✅ Etherscan disponível

**Limitações:**
- ❌ Requer configuração FHEVM adicional
- ❌ Mais complexo

## 📝 Scripts de Implantação

### Script Principal: deploy.js

```bash
# Implantação básica
npx hardhat run scripts/deploy.js --network <rede>

# Com parâmetros customizados
ITEM_DESCRIPTION="Minha Arte NFT" AUCTION_DURATION=86400 npx hardhat run scripts/deploy.js --network <rede>
```

### Parâmetros Configuráveis

| Parâmetro | Padrão | Descrição |
|-----------|--------|----------|
| `ITEM_DESCRIPTION` | "Obra de Arte Digital Exclusiva" | Descrição do item |
| `AUCTION_DURATION` | 86400 (24h) | Duração em segundos |

### Exemplo de Saída

```
🚀 Iniciando implantação do contrato BlindAuction...
📝 Implantando com a conta: 0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c
💰 Balance da conta: 1.5 ETH
📋 Parâmetros do leilão:
   - Item: Obra de Arte Digital Exclusiva
   - Duração: 24 horas

🔨 Compilando e implantando contrato...
✅ Contrato implantado com sucesso!
📍 Endereço do contrato: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📊 Informações do leilão:
   - Leiloeiro: 0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c
   - Item: Obra de Arte Digital Exclusiva
   - Fim do leilão: 25/01/2024 15:30:00
   - Status ativo: true

💾 Informações de implantação salvas em: deployments/deployment-1706198400000.json
🎉 Implantação concluída com sucesso!
```

## 🔧 Verificação da Implantação

### Script de Verificação

```bash
# Criar script de verificação
cat > scripts/verify-deployment.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.log("❌ Defina CONTRACT_ADDRESS");
    return;
  }
  
  const BlindAuction = await ethers.getContractFactory("BlindAuction");
  const contract = BlindAuction.attach(contractAddress);
  
  try {
    const info = await contract.getAuctionInfo();
    console.log("✅ Contrato verificado com sucesso!");
    console.log("📊 Informações:", {
      auctioneer: info[0],
      item: info[1],
      endTime: new Date(Number(info[2]) * 1000),
      ended: info[3],
      revealed: info[4],
      bidders: Number(info[5])
    });
  } catch (error) {
    console.log("❌ Erro na verificação:", error.message);
  }
}

main().catch(console.error);
EOF

# Executar verificação
CONTRAT_ADDRESS=0x... npx hardhat run scripts/verify-deployment.js --network <rede>
```

### Verificação Manual

```bash
# Conectar ao console Hardhat
npx hardhat console --network <rede>

# No console:
const BlindAuction = await ethers.getContractFactory("BlindAuction");
const contract = BlindAuction.attach("0x..."); // Seu endereço
const info = await contract.getAuctionInfo();
console.log(info);
```

## 🧪 Testando a Implantação

### Testes Básicos

```bash
# Executar testes locais
npm test

# Testes específicos
npx hardhat test test/BlindAuction.test.js

# Testes com cobertura
npx hardhat coverage
```

### Teste de Integração

```bash
# Definir endereço do contrato
export CONTRACT_ADDRESS="0x..."

# Executar interação de teste
npx hardhat run scripts/interact.js --network <rede>

# Finalizar teste
npx hardhat run scripts/finalize.js --network <rede>
```

## 📊 Monitoramento

### Logs de Eventos

```javascript
// Monitorar eventos em tempo real
const contract = BlindAuction.attach(contractAddress);

contract.on("BidPlaced", (bidder, bidHash, event) => {
  console.log(`📝 Novo lance: ${bidder}`);
  console.log(`🔗 Hash: ${bidHash}`);
  console.log(`⛽ Gas usado: ${event.gasUsed}`);
});

contract.on("AuctionEnded", (endTime) => {
  console.log(`🏁 Leilão finalizado em: ${new Date(endTime * 1000)}`);
});

contract.on("WinnerRevealed", (winner, amount) => {
  console.log(`🏆 Vencedor: ${winner}`);
  console.log(`💰 Valor: ${amount}`);
});
```

### Dashboard Simples

```bash
# Criar script de monitoramento
cat > scripts/monitor.js << 'EOF'
const { ethers } = require("hardhat");

async function monitor() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contract = BlindAuction.attach(contractAddress);
  
  setInterval(async () => {
    const info = await contract.getAuctionInfo();
    const isActive = await contract.isAuctionActive();
    
    console.clear();
    console.log("🔍 MONITOR DO LEILÃO");
    console.log("═══════════════════");
    console.log(`📍 Contrato: ${contractAddress}`);
    console.log(`👤 Leiloeiro: ${info[0]}`);
    console.log(`🎨 Item: ${info[1]}`);
    console.log(`⏰ Fim: ${new Date(Number(info[2]) * 1000)}`);
    console.log(`🔄 Ativo: ${isActive ? '✅' : '❌'}`);
    console.log(`👥 Licitantes: ${info[5]}`);
    console.log(`🏆 Revelado: ${info[4] ? '✅' : '❌'}`);
    
    if (info[4]) {
      const winner = await contract.winner();
      const winningBid = await contract.winningBid();
      console.log(`🥇 Vencedor: ${winner}`);
      console.log(`💰 Lance: ${winningBid}`);
    }
  }, 5000);
}

monitor().catch(console.error);
EOF

# Executar monitor
CONTRAT_ADDRESS=0x... npx hardhat run scripts/monitor.js --network <rede>
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Erro: "insufficient funds"
```bash
# Verificar saldo
npx hardhat run scripts/check-balance.js --network <rede>

# Obter mais ETH de teste
# FHEVM: https://faucet.zama.ai
# Sepolia: https://sepoliafaucet.com
```

#### Erro: "nonce too high"
```bash
# Reset do nonce (MetaMask)
# Settings > Advanced > Reset Account

# Ou usar flag --reset
npx hardhat run scripts/deploy.js --network <rede> --reset
```

#### Erro: "network not found"
```bash
# Verificar hardhat.config.js
# Confirmar nome da rede
# Verificar URL do RPC
```

#### Erro: "contract not deployed"
```bash
# Verificar endereço do contrato
# Confirmar rede correta
# Verificar se a transação foi confirmada
```

### Logs de Debug

```bash
# Habilitar logs detalhados
DEBUG=* npx hardhat run scripts/deploy.js --network <rede>

# Logs específicos do Hardhat
DEBUG=hardhat:* npx hardhat run scripts/deploy.js --network <rede>
```

## 📋 Checklist de Implantação

### Pré-implantação
- [ ] Node.js v18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Chave privada definida (sem 0x)
- [ ] RPC URL configurada
- [ ] ETH suficiente na carteira
- [ ] Testes passando (`npm test`)

### Durante a Implantação
- [ ] Rede correta selecionada
- [ ] Parâmetros do leilão definidos
- [ ] Transação confirmada
- [ ] Endereço do contrato salvo
- [ ] Verificação básica executada

### Pós-implantação
- [ ] Contrato verificado
- [ ] Eventos monitorados
- [ ] Teste de interação realizado
- [ ] Documentação atualizada
- [ ] Backup das informações

## 🔐 Segurança

### Melhores Práticas

1. **Chaves Privadas**
   - ✅ Use variáveis de ambiente
   - ✅ Nunca commite chaves no Git
   - ✅ Use carteiras hardware em produção

2. **Redes**
   - ✅ Teste em redes de desenvolvimento primeiro
   - ✅ Use RPCs confiáveis
   - ✅ Monitore transações

3. **Contratos**
   - ✅ Audite código antes da produção
   - ✅ Use timeouts apropriados
   - ✅ Implemente pausas de emergência

### Arquivo .env Seguro

```env
# ✅ Bom
PRIVATE_KEY=abc123...  # Sem 0x, sem espaços

# ❌ Ruim
PRIVATE_KEY="0xabc123..."  # Com 0x e aspas
PRIVATE_KEY= abc123...     # Com espaços
```

## 📞 Suporte

### Recursos de Ajuda

- 📖 [Documentação Zama](https://docs.zama.ai/fhevm)
- 💬 [Discord Zama](https://discord.gg/zama)
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm/issues)
- 📧 Email: suporte@exemplo.com

### Informações para Suporte

Ao solicitar ajuda, inclua:

1. **Versões**:
   ```bash
   node --version
   npm --version
   npx hardhat --version
   ```

2. **Rede**: Qual rede está usando
3. **Erro**: Mensagem completa do erro
4. **Código**: Trechos relevantes
5. **Logs**: Saída completa do comando

---

**🎉 Parabéns!** Você agora tem um guia completo para implantar seu leilão cego confidencial com FHEVM!