# 📚 Como Salvar o Projeto no GitHub

## 🎯 Pré-requisitos

### 1. Instalar Git
- **Windows**: Baixe de [git-scm.com](https://git-scm.com/download/win)
- **Verificar instalação**: `git --version`

### 2. Criar Conta no GitHub
- Acesse [github.com](https://github.com) e crie uma conta
- Verifique seu email

### 3. Configurar Git (Primeira vez)
```bash
# Configurar nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Verificar configuração
git config --list
```

## 🚀 Método 1: Via Interface Web (Mais Fácil)

### Passo 1: Criar Repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"** (botão verde)
3. Configure o repositório:
   - **Repository name**: `leilao-cego-fhevm`
   - **Description**: `Contrato Inteligente de Leilão Cego Confidencial usando Zama FHEVM`
   - **Visibility**: Public (ou Private se preferir)
   - ✅ **Add a README file**
   - ✅ **Add .gitignore**: Node
   - **License**: MIT License
4. Clique em **"Create repository"**

### Passo 2: Upload dos Arquivos
1. No repositório criado, clique em **"uploading an existing file"**
2. Arraste todos os arquivos do projeto para a área de upload
3. Ou clique em **"choose your files"** e selecione todos os arquivos
4. Adicione uma mensagem de commit: `Implementação inicial do leilão cego FHEVM`
5. Clique em **"Commit changes"**

## 🛠️ Método 2: Via Linha de Comando (Recomendado)

### Passo 1: Inicializar Repositório Local
```bash
# Navegar para o diretório do projeto
cd "c:\Users\User\Desktop\Contrato Inteligente Confidencial com ZamafhEVM"

# Inicializar repositório Git
git init

# Verificar status
git status
```

### Passo 2: Adicionar Arquivos
```bash
# Adicionar todos os arquivos
git add .

# Ou adicionar arquivos específicos
git add package.json
git add contracts/
git add scripts/
git add test/
git add utils/
git add *.md
git add hardhat.config.js
git add .gitignore

# Verificar arquivos adicionados
git status
```

### Passo 3: Fazer Commit Inicial
```bash
# Commit inicial
git commit -m "🎉 Implementação inicial do leilão cego confidencial com Zama FHEVM

- Contrato BlindAuction.sol com funcionalidades FHEVM completas
- Scripts de implantação, interação e finalização
- Testes unitários abrangentes
- Documentação técnica detalhada
- Configuração Hardhat com suporte FHEVM"
```

### Passo 4: Criar Repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"**
3. Configure:
   - **Repository name**: `leilao-cego-fhevm`
   - **Description**: `Contrato Inteligente de Leilão Cego Confidencial usando Zama FHEVM`
   - **Visibility**: Public
   - ❌ **NÃO** marque "Add a README file" (já temos)
   - ❌ **NÃO** adicione .gitignore (já temos)
4. Clique em **"Create repository"**

### Passo 5: Conectar e Enviar
```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/leilao-cego-fhevm.git

# Verificar remote
git remote -v

# Enviar para GitHub
git branch -M main
git push -u origin main
```

## 🔐 Autenticação

### Opção 1: Token de Acesso Pessoal (Recomendado)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em **"Generate new token (classic)"**
3. Configure:
   - **Note**: `Token para leilao-cego-fhevm`
   - **Expiration**: 90 days (ou conforme preferir)
   - **Scopes**: ✅ repo (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **⚠️ COPIE O TOKEN** (não será mostrado novamente)

### Usar Token no Git
```bash
# Quando solicitado usuário/senha:
# Username: seu_usuario_github
# Password: cole_o_token_aqui

# Ou configurar credencial helper
git config --global credential.helper store
```

### Opção 2: SSH (Avançado)
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub: Settings → SSH and GPG keys → New SSH key
```

## 📁 Estrutura Final no GitHub

```
leilao-cego-fhevm/
├── 📄 README.md
├── 📄 FHEVM_GUIDE.md
├── 📄 DEPLOYMENT_GUIDE.md
├── 📄 GITHUB_SETUP.md
├── 📄 package.json
├── 📄 hardhat.config.js
├── 📄 .gitignore
├── 📄 .env.example
├── 📁 contracts/
│   ├── BlindAuction.sol
│   └── FHEVMConfig.sol
├── 📁 scripts/
│   ├── deploy.js
│   ├── interact.js
│   └── finalize.js
├── 📁 test/
│   └── BlindAuction.test.js
└── 📁 utils/
    ├── instance.js
    └── signers.js
```

## 🏷️ Melhorar o Repositório

### Adicionar Topics
1. No repositório GitHub, clique na engrenagem ⚙️ ao lado de "About"
2. Adicione topics:
   ```
   blockchain, ethereum, fhevm, zama, privacy, auction, solidity, hardhat, confidential-computing, homomorphic-encryption
   ```

### Criar Releases
```bash
# Criar tag para versão
git tag -a v1.0.0 -m "Versão 1.0.0 - Implementação inicial completa"
git push origin v1.0.0
```

### Adicionar Badges ao README
Adicione no início do README.md:
```markdown
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)
![FHEVM](https://img.shields.io/badge/FHEVM-0.4.0-green)
![License](https://img.shields.io/badge/License-MIT-red)
```

## 🔄 Fluxo de Trabalho Futuro

### Fazer Mudanças
```bash
# Verificar status
git status

# Adicionar mudanças
git add .

# Commit com mensagem descritiva
git commit -m "✨ Adicionar funcionalidade X"

# Enviar para GitHub
git push
```

### Branches para Features
```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Fazer mudanças e commits
git add .
git commit -m "Implementar nova funcionalidade"

# Enviar branch
git push -u origin feature/nova-funcionalidade

# No GitHub: criar Pull Request
```

## 🚨 Troubleshooting

### Erro: "remote origin already exists"
```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU_USUARIO/leilao-cego-fhevm.git
```

### Erro: "failed to push some refs"
```bash
# Puxar mudanças primeiro
git pull origin main --allow-unrelated-histories

# Resolver conflitos se houver
# Depois fazer push
git push
```

### Erro: "Authentication failed"
- Verifique se está usando o token correto
- Token deve ter permissões de `repo`
- Username deve ser seu usuário GitHub

### Arquivos Muito Grandes
```bash
# Ver arquivos grandes
git ls-files | xargs ls -la | sort -k5 -rn | head

# Remover do histórico se necessário
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch arquivo_grande' --prune-empty --tag-name-filter cat -- --all
```

## 📋 Checklist Final

- [ ] Git instalado e configurado
- [ ] Conta GitHub criada
- [ ] Repositório criado no GitHub
- [ ] Arquivos locais commitados
- [ ] Remote origin configurado
- [ ] Push inicial realizado
- [ ] README.md visível no GitHub
- [ ] .gitignore funcionando (node_modules não enviado)
- [ ] .env não commitado (apenas .env.example)
- [ ] Topics adicionados
- [ ] Descrição do repositório preenchida

## 🎉 Pronto!

Seu projeto agora está salvo no GitHub e pode ser:
- ✅ Acessado de qualquer lugar
- ✅ Compartilhado com outros desenvolvedores
- ✅ Clonado para outros computadores
- ✅ Usado como portfólio
- ✅ Contribuído por outros

### Próximos Passos Sugeridos
1. **Adicionar CI/CD**: GitHub Actions para testes automáticos
2. **Documentar API**: Adicionar documentação das funções
3. **Criar Examples**: Pasta com exemplos de uso
4. **Adicionar Licença**: Arquivo LICENSE detalhado
5. **Configurar Issues**: Templates para bugs e features

---

**🔗 Link do seu repositório**: `https://github.com/SEU_USUARIO/leilao-cego-fhevm`