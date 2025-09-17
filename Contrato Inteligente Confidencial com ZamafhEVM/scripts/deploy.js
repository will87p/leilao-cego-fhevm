const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando implantação do contrato BlindAuction...");
  
  // Obter o signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Implantando com a conta:", deployer.address);
  
  // Verificar balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance da conta:", ethers.formatEther(balance), "ETH");
  
  // Parâmetros do leilão
  const ITEM_DESCRIPTION = "Obra de Arte Digital Exclusiva";
  const AUCTION_DURATION = 24 * 60 * 60; // 24 horas em segundos
  
  console.log("📋 Parâmetros do leilão:");
  console.log("   - Item:", ITEM_DESCRIPTION);
  console.log("   - Duração:", AUCTION_DURATION / 3600, "horas");
  
  try {
    // Deploy do contrato
    console.log("\n🔨 Compilando e implantando contrato...");
    const BlindAuctionFactory = await ethers.getContractFactory("BlindAuction");
    
    const blindAuction = await BlindAuctionFactory.deploy(
      ITEM_DESCRIPTION,
      AUCTION_DURATION
    );
    
    // Aguardar confirmação
    await blindAuction.waitForDeployment();
    const contractAddress = await blindAuction.getAddress();
    
    console.log("✅ Contrato implantado com sucesso!");
    console.log("📍 Endereço do contrato:", contractAddress);
    
    // Verificar informações do contrato
    const auctionInfo = await blindAuction.getAuctionInfo();
    console.log("\n📊 Informações do leilão:");
    console.log("   - Leiloeiro:", auctionInfo[0]);
    console.log("   - Item:", auctionInfo[1]);
    console.log("   - Fim do leilão:", new Date(Number(auctionInfo[2]) * 1000).toLocaleString());
    console.log("   - Status ativo:", await blindAuction.isAuctionActive());
    
    // Salvar informações de implantação
    const deploymentInfo = {
      contractAddress,
      deployer: deployer.address,
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId.toString(),
      itemDescription: ITEM_DESCRIPTION,
      auctionDuration: AUCTION_DURATION,
      deploymentTime: new Date().toISOString(),
      auctionEndTime: new Date(Number(auctionInfo[2]) * 1000).toISOString(),
    };
    
    // Criar diretório deployments se não existir
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Salvar arquivo de implantação
    const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n💾 Informações de implantação salvas em:", deploymentFile);
    
    // Instruções para interação
    console.log("\n📖 Próximos passos:");
    console.log("1. Configure seu ambiente FHEVM com o endereço do contrato");
    console.log("2. Use as ferramentas FHEVM para criptografar lances");
    console.log("3. Chame placeBid() com lances criptografados");
    console.log("4. Finalize o leilão com endAuction()");
    console.log("5. Revele o vencedor com revealWinner()");
    
    console.log("\n🎉 Implantação concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante a implantação:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Dica: Certifique-se de que sua conta tem ETH suficiente para a implantação");
    } else if (error.message.includes("network")) {
      console.log("💡 Dica: Verifique se você está conectado à rede correta");
    }
    
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erro fatal:", error);
      process.exit(1);
    });
}

module.exports = { main };