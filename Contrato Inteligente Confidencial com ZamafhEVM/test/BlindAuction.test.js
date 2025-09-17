const { expect } = require("chai");
const { ethers } = require("hardhat");
const { createInstances } = require("../utils/instance");
const { getSigners } = require("../utils/signers");

describe("BlindAuction", function () {
  let blindAuction;
  let auctioneer, bidder1, bidder2, bidder3;
  let instances;
  let contractAddress;

  const AUCTION_DURATION = 3600; // 1 hora em segundos
  const ITEM_DESCRIPTION = "Obra de Arte Rara";

  beforeEach(async function () {
    // Obter signers
    const signers = await getSigners();
    auctioneer = signers.alice;
    bidder1 = signers.bob;
    bidder2 = signers.carol;
    bidder3 = signers.dave;

    // Deploy do contrato
    const BlindAuctionFactory = await ethers.getContractFactory("BlindAuction");
    blindAuction = await BlindAuctionFactory.connect(auctioneer).deploy(
      ITEM_DESCRIPTION,
      AUCTION_DURATION
    );
    await blindAuction.waitForDeployment();
    contractAddress = await blindAuction.getAddress();

    // Criar instâncias FHEVM para cada usuário
    instances = await createInstances(contractAddress, ethers, signers);
  });

  describe("Deployment", function () {
    it("Deve definir o leiloeiro corretamente", async function () {
      expect(await blindAuction.auctioneer()).to.equal(auctioneer.address);
    });

    it("Deve definir a descrição do item corretamente", async function () {
      expect(await blindAuction.itemDescription()).to.equal(ITEM_DESCRIPTION);
    });

    it("Deve definir o tempo de fim do leilão corretamente", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const auctionEndTime = await blindAuction.auctionEndTime();
      expect(Number(auctionEndTime)).to.be.closeTo(currentTime + AUCTION_DURATION, 10);
    });

    it("Deve inicializar com leilão ativo", async function () {
      expect(await blindAuction.isAuctionActive()).to.be.true;
      expect(await blindAuction.auctionEnded()).to.be.false;
      expect(await blindAuction.winnerRevealed()).to.be.false;
    });
  });

  describe("Fazer Lances", function () {
    it("Deve permitir fazer um lance válido", async function () {
      const bidAmount = 1000;
      const encryptedBid = instances.alice.encrypt64(bidAmount);
      
      await expect(
        blindAuction.connect(bidder1).placeBid(encryptedBid)
      ).to.emit(blindAuction, "BidPlaced")
        .withArgs(bidder1.address, expect.any(String));

      expect(await blindAuction.getBidInfo(bidder1.address)).to.be.true;
    });

    it("Deve permitir múltiplos lances de diferentes usuários", async function () {
      const bid1 = instances.bob.encrypt64(1000);
      const bid2 = instances.carol.encrypt64(1500);
      const bid3 = instances.dave.encrypt64(800);

      await blindAuction.connect(bidder1).placeBid(bid1);
      await blindAuction.connect(bidder2).placeBid(bid2);
      await blindAuction.connect(bidder3).placeBid(bid3);

      expect(await blindAuction.getBidInfo(bidder1.address)).to.be.true;
      expect(await blindAuction.getBidInfo(bidder2.address)).to.be.true;
      expect(await blindAuction.getBidInfo(bidder3.address)).to.be.true;

      const bidders = await blindAuction.getBidders();
      expect(bidders).to.have.lengthOf(3);
      expect(bidders).to.include(bidder1.address);
      expect(bidders).to.include(bidder2.address);
      expect(bidders).to.include(bidder3.address);
    });

    it("Deve permitir que um usuário atualize seu lance", async function () {
      const initialBid = instances.bob.encrypt64(1000);
      const updatedBid = instances.bob.encrypt64(1200);

      await blindAuction.connect(bidder1).placeBid(initialBid);
      await blindAuction.connect(bidder1).placeBid(updatedBid);

      // Deve ainda ter apenas um licitante na lista
      const bidders = await blindAuction.getBidders();
      expect(bidders).to.have.lengthOf(1);
      expect(bidders[0]).to.equal(bidder1.address);
    });

    it("Deve rejeitar lance de valor zero", async function () {
      const zeroBid = instances.bob.encrypt64(0);
      
      await expect(
        blindAuction.connect(bidder1).placeBid(zeroBid)
      ).to.be.revertedWith("Lance deve ser maior que zero");
    });

    it("Deve rejeitar lances após o fim do leilão", async function () {
      // Finalizar o leilão
      await blindAuction.connect(auctioneer).endAuction();
      
      const bid = instances.bob.encrypt64(1000);
      
      await expect(
        blindAuction.connect(bidder1).placeBid(bid)
      ).to.be.revertedWith("Leilao foi finalizado");
    });
  });

  describe("Finalizar Leilão", function () {
    beforeEach(async function () {
      // Fazer alguns lances antes de cada teste
      const bid1 = instances.bob.encrypt64(1000);
      const bid2 = instances.carol.encrypt64(1500);
      
      await blindAuction.connect(bidder1).placeBid(bid1);
      await blindAuction.connect(bidder2).placeBid(bid2);
    });

    it("Deve permitir que o leiloeiro finalize o leilão", async function () {
      await expect(
        blindAuction.connect(auctioneer).endAuction()
      ).to.emit(blindAuction, "AuctionEnded");

      expect(await blindAuction.auctionEnded()).to.be.true;
      expect(await blindAuction.isAuctionActive()).to.be.false;
    });

    it("Deve rejeitar finalização por não-leiloeiro antes do tempo", async function () {
      await expect(
        blindAuction.connect(bidder1).endAuction()
      ).to.be.revertedWith("Apenas o leiloeiro pode finalizar antes do tempo ou qualquer um apos o tempo");
    });

    it("Deve rejeitar finalização dupla", async function () {
      await blindAuction.connect(auctioneer).endAuction();
      
      await expect(
        blindAuction.connect(auctioneer).endAuction()
      ).to.be.revertedWith("Leilao ja foi finalizado");
    });
  });

  describe("Revelar Vencedor", function () {
    beforeEach(async function () {
      // Fazer lances e finalizar o leilão
      const bid1 = instances.bob.encrypt64(1000);
      const bid2 = instances.carol.encrypt64(1500);
      const bid3 = instances.dave.encrypt64(800);
      
      await blindAuction.connect(bidder1).placeBid(bid1);
      await blindAuction.connect(bidder2).placeBid(bid2);
      await blindAuction.connect(bidder3).placeBid(bid3);
      
      await blindAuction.connect(auctioneer).endAuction();
    });

    it("Deve permitir que o leiloeiro revele o vencedor", async function () {
      // Nota: Este teste pode precisar de ajustes dependendo da implementação do gateway
      await expect(
        blindAuction.connect(auctioneer).revealWinner()
      ).to.not.be.reverted;
    });

    it("Deve rejeitar revelação por não-leiloeiro", async function () {
      await expect(
        blindAuction.connect(bidder1).revealWinner()
      ).to.be.revertedWith("Apenas o leiloeiro pode executar esta acao");
    });

    it("Deve rejeitar revelação antes do fim do leilão", async function () {
      // Deploy de um novo contrato para este teste
      const BlindAuctionFactory = await ethers.getContractFactory("BlindAuction");
      const newAuction = await BlindAuctionFactory.connect(auctioneer).deploy(
        ITEM_DESCRIPTION,
        AUCTION_DURATION
      );
      
      const bid = instances.bob.encrypt64(1000);
      await newAuction.connect(bidder1).placeBid(bid);
      
      await expect(
        newAuction.connect(auctioneer).revealWinner()
      ).to.be.revertedWith("Leilao ainda esta ativo");
    });
  });

  describe("Informações do Leilão", function () {
    it("Deve retornar informações corretas do leilão", async function () {
      const auctionInfo = await blindAuction.getAuctionInfo();
      
      expect(auctionInfo[0]).to.equal(auctioneer.address); // _auctioneer
      expect(auctionInfo[1]).to.equal(ITEM_DESCRIPTION);   // _itemDescription
      expect(auctionInfo[3]).to.be.false;                  // _auctionEnded
      expect(auctionInfo[4]).to.be.false;                  // _winnerRevealed
      expect(Number(auctionInfo[5])).to.equal(0);          // _totalBidders
    });

    it("Deve atualizar o número total de licitantes", async function () {
      const bid1 = instances.bob.encrypt64(1000);
      const bid2 = instances.carol.encrypt64(1500);
      
      await blindAuction.connect(bidder1).placeBid(bid1);
      await blindAuction.connect(bidder2).placeBid(bid2);
      
      const auctionInfo = await blindAuction.getAuctionInfo();
      expect(Number(auctionInfo[5])).to.equal(2); // _totalBidders
    });
  });

  describe("Funções de Emergência", function () {
    it("Deve permitir parada de emergência pelo leiloeiro", async function () {
      await expect(
        blindAuction.connect(auctioneer).emergencyStop()
      ).to.emit(blindAuction, "AuctionEnded");

      expect(await blindAuction.auctionEnded()).to.be.true;
    });

    it("Deve rejeitar parada de emergência por não-leiloeiro", async function () {
      await expect(
        blindAuction.connect(bidder1).emergencyStop()
      ).to.be.revertedWith("Apenas o leiloeiro pode executar esta acao");
    });
  });
});