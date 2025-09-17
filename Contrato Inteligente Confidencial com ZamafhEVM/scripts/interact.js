const { ethers } = require("hardhat");
const { createInstance } = require("../utils/instance");
const { getSigners } = require("../utils/signers");

/**
 * Script para interagir com o contrato BlindAuction implantado
 */
async function main() {
  // Endereço do contrato (substitua pelo endereço real após implantação)
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x...";
  
  if (CONTRACT_ADDRESS === "0x...") {
    console.log("❌ Por favor, defina CONTRACT_ADDRESS no arquivo .env ou como variável de ambiente");
    process.exit(1);
  }
  
  console.log("🔗 Conectando ao contrato:", CONTRACT_ADDRESS);
  
  // Obter signers
  const signers = await getSigners();
  const { alice, bob, carol, dave } = signers;
  
  // Conectar ao contrato
  const BlindAuction = await ethers.getContractFactory("BlindAuction");
  const blindAuction = BlindAuction.attach(CONTRACT_ADDRESS);
  
  try {
    // Verificar informações do leilão
    console.log("\n📊 Informações do Leilão:");
    const auctionInfo = await blindAuction.getAuctionInfo();
    console.log("   - Leiloeiro:", auctionInfo[0]);
    console.log("   - Item:", auctionInfo[1]);
    console.log("   - Fim do leilão:", new Date(Number(auctionInfo[2]) * 1000).toLocaleString());
    console.log("   - Leilão finalizado:", auctionInfo[3]);
    console.log("   - Vencedor revelado:", auctionInfo[4]);
    console.log("   - Total de licitantes:", Number(auctionInfo[5]));
    console.log("   - Status ativo:", await blindAuction.isAuctionActive());
    
    // Criar instâncias FHEVM
    console.log("\n🔐 Criando instâncias FHEVM...");
    const instanceBob = await createInstance(CONTRACT_ADDRESS, ethers, bob);
    const instanceCarol = await createInstance(CONTRACT_ADDRESS, ethers, carol);
    const instanceDave = await createInstance(CONTRACT_ADDRESS, ethers, dave);
    
    // Verificar se o leilão está ativo
    const isActive = await blindAuction.isAuctionActive();
    
    if (isActive) {
      console.log("\n💰 Fazendo lances criptografados...");
      
      // Lance do Bob: 1000
      console.log("   - Bob fazendo lance de 1000...");
      const bobBid = instanceBob.encrypt64(1000);
      const tx1 = await blindAuction.connect(bob).placeBid(bobBid);
      await tx1.wait();
      console.log("     ✅ Lance do Bob confirmado");
      
      // Lance da Carol: 1500
      console.log("   - Carol fazendo lance de 1500...");
      const carolBid = instanceCarol.encrypt64(1500);
      const tx2 = await blindAuction.connect(carol).placeBid(carolBid);
      await tx2.wait();
      console.log("     ✅ Lance da Carol confirmado");
      
      // Lance do Dave: 800
      console.log("   - Dave fazendo lance de 800...");
      const daveBid = instanceDave.encrypt64(800);
      const tx3 = await blindAuction.connect(dave).placeBid(daveBid);
      await tx3.wait();
      console.log("     ✅ Lance do Dave confirmado");
      
      // Verificar licitantes
      const bidders = await blindAuction.getBidders();
      console.log("\n👥 Licitantes registrados:", bidders.length);
      bidders.forEach((bidder, index) => {
        console.log(`   ${index + 1}. ${bidder}`);
      });
      
      console.log("\n⏰ Para finalizar o leilão, execute:");
      console.log("   npx hardhat run scripts/finalize.js --network <sua_rede>");
      
    } else {
      console.log("\n⚠️  Leilão não está ativo");
      
      // Verificar se pode revelar vencedor
      const auctionEnded = auctionInfo[3];
      const winnerRevealed = auctionInfo[4];
      
      if (auctionEnded && !winnerRevealed) {
        console.log("\n🏆 Revelando vencedor...");
        const revealTx = await blindAuction.connect(alice).revealWinner();
        await revealTx.wait();
        console.log("   ✅ Solicitação de revelação enviada");
        console.log("   ⏳ Aguardando processamento pelo gateway...");
      } else if (winnerRevealed) {
        console.log("\n🎉 Resultados do Leilão:");
        console.log("   - Vencedor:", await blindAuction.winner());
        console.log("   - Lance vencedor:", (await blindAuction.winningBid()).toString());
      }
    }
    
  } catch (error) {
    console.error("❌ Erro durante a interação:", error.message);
    
    if (error.message.includes("Lance deve ser maior que zero")) {
      console.log("💡 Dica: Certifique-se de que o lance é maior que zero");
    } else if (error.message.includes("Leilao ja terminou")) {
      console.log("💡 Dica: O leilão já terminou, não é possível fazer mais lances");
    }
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