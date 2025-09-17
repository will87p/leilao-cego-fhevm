const { ethers } = require("hardhat");
const { getSigners } = require("../utils/signers");

/**
 * Script para finalizar o leilão e revelar o vencedor
 */
async function main() {
  // Endereço do contrato (substitua pelo endereço real após implantação)
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x...";
  
  if (CONTRACT_ADDRESS === "0x...") {
    console.log("❌ Por favor, defina CONTRACT_ADDRESS no arquivo .env ou como variável de ambiente");
    process.exit(1);
  }
  
  console.log("🏁 Finalizando leilão no contrato:", CONTRACT_ADDRESS);
  
  // Obter signers
  const signers = await getSigners();
  const { alice } = signers; // Alice é o leiloeiro
  
  // Conectar ao contrato
  const BlindAuction = await ethers.getContractFactory("BlindAuction");
  const blindAuction = BlindAuction.attach(CONTRACT_ADDRESS);
  
  try {
    // Verificar informações atuais do leilão
    console.log("\n📊 Status atual do leilão:");
    const auctionInfo = await blindAuction.getAuctionInfo();
    console.log("   - Leiloeiro:", auctionInfo[0]);
    console.log("   - Item:", auctionInfo[1]);
    console.log("   - Fim programado:", new Date(Number(auctionInfo[2]) * 1000).toLocaleString());
    console.log("   - Já finalizado:", auctionInfo[3]);
    console.log("   - Vencedor revelado:", auctionInfo[4]);
    console.log("   - Total de licitantes:", Number(auctionInfo[5]));
    
    const isActive = await blindAuction.isAuctionActive();
    console.log("   - Status ativo:", isActive);
    
    // Verificar se há licitantes
    const totalBidders = Number(auctionInfo[5]);
    if (totalBidders === 0) {
      console.log("\n⚠️  Nenhum lance foi feito neste leilão");
      console.log("   Não é possível finalizar um leilão sem lances");
      return;
    }
    
    // Listar licitantes
    const bidders = await blindAuction.getBidders();
    console.log("\n👥 Licitantes participantes:");
    bidders.forEach((bidder, index) => {
      console.log(`   ${index + 1}. ${bidder}`);
    });
    
    // Finalizar leilão se ainda estiver ativo
    if (isActive) {
      console.log("\n⏰ Finalizando leilão...");
      const endTx = await blindAuction.connect(alice).endAuction();
      await endTx.wait();
      console.log("   ✅ Leilão finalizado com sucesso");
    } else {
      console.log("\n✅ Leilão já foi finalizado");
    }
    
    // Verificar se o vencedor já foi revelado
    const updatedInfo = await blindAuction.getAuctionInfo();
    const winnerRevealed = updatedInfo[4];
    
    if (!winnerRevealed) {
      console.log("\n🔓 Revelando vencedor...");
      console.log("   ⏳ Solicitando descriptografia ao gateway FHEVM...");
      
      try {
        const revealTx = await blindAuction.connect(alice).revealWinner();
        await revealTx.wait();
        console.log("   ✅ Solicitação de revelação enviada com sucesso");
        console.log("   📡 Aguardando processamento pelo gateway...");
        
        // Aguardar um pouco para o processamento
        console.log("   ⏳ Aguardando 10 segundos para processamento...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Verificar se o vencedor foi revelado
        const finalInfo = await blindAuction.getAuctionInfo();
        if (finalInfo[4]) {
          console.log("\n🎉 Vencedor revelado com sucesso!");
          await displayResults(blindAuction);
        } else {
          console.log("\n⏳ Revelação ainda em processamento...");
          console.log("   Execute este script novamente em alguns minutos para verificar o resultado");
        }
        
      } catch (error) {
        if (error.message.includes("Vencedor ja foi revelado")) {
          console.log("   ✅ Vencedor já foi revelado anteriormente");
          await displayResults(blindAuction);
        } else {
          throw error;
        }
      }
    } else {
      console.log("\n🎉 Vencedor já foi revelado!");
      await displayResults(blindAuction);
    }
    
  } catch (error) {
    console.error("❌ Erro durante a finalização:", error.message);
    
    if (error.message.includes("Apenas o leiloeiro")) {
      console.log("💡 Dica: Apenas o leiloeiro pode finalizar o leilão");
    } else if (error.message.includes("Leilao ja foi finalizado")) {
      console.log("💡 Dica: O leilão já foi finalizado anteriormente");
    }
  }
}

/**
 * Exibe os resultados finais do leilão
 */
async function displayResults(blindAuction) {
  try {
    const winner = await blindAuction.winner();
    const winningBid = await blindAuction.winningBid();
    
    console.log("\n🏆 RESULTADOS FINAIS DO LEILÃO:");
    console.log("   ═══════════════════════════════");
    console.log(`   🥇 Vencedor: ${winner}`);
    console.log(`   💰 Lance vencedor: ${winningBid.toString()} unidades`);
    console.log("   ═══════════════════════════════");
    
    console.log("\n📋 Próximos passos:");
    console.log("   1. O vencedor pode reivindicar o item com claimItem()");
    console.log("   2. Os perdedores podem verificar seus lances (se implementado)");
    console.log("   3. O leiloeiro pode processar a entrega do item");
    
  } catch (error) {
    console.log("⚠️  Não foi possível obter os resultados finais:", error.message);
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

module.exports = { main, displayResults };