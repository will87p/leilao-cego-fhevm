// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title BlindAuction
 * @dev Contrato de leilão cego confidencial usando Zama FHEVM
 * @notice Este contrato permite lances confidenciais onde apenas o vencedor é revelado ao final
 */
contract BlindAuction is GatewayCaller {
    using TFHE for euint64;
    using TFHE for ebool;

    // Estrutura para armazenar informações do lance
    struct Bid {
        euint64 amount;     // Valor do lance criptografado
        address bidder;     // Endereço do licitante
        bool exists;        // Flag para verificar se o lance existe
    }

    // Variáveis de estado
    address public auctioneer;           // Criador do leilão
    string public itemDescription;       // Descrição do item leiloado
    uint256 public auctionEndTime;      // Tempo de fim do leilão
    bool public auctionEnded;           // Flag indicando se o leilão terminou
    bool public winnerRevealed;         // Flag indicando se o vencedor foi revelado
    
    // Dados do vencedor (revelados apenas ao final)
    address public winner;
    uint256 public winningBid;
    
    // Mapeamento de lances por endereço
    mapping(address => Bid) public bids;
    address[] public bidders;           // Lista de licitantes
    
    // Lance atual mais alto (criptografado)
    euint64 private highestBid;
    address private currentWinner;
    
    // Eventos
    event BidPlaced(address indexed bidder, bytes32 bidHash);
    event AuctionEnded(uint256 endTime);
    event WinnerRevealed(address indexed winner, uint256 amount);
    event FundsWithdrawn(address indexed bidder, uint256 amount);

    // Modificadores
    modifier onlyAuctioneer() {
        require(msg.sender == auctioneer, "Apenas o leiloeiro pode executar esta acao");
        _;
    }

    modifier auctionActive() {
        require(block.timestamp < auctionEndTime, "Leilao ja terminou");
        require(!auctionEnded, "Leilao foi finalizado");
        _;
    }

    modifier auctionFinished() {
        require(block.timestamp >= auctionEndTime || auctionEnded, "Leilao ainda esta ativo");
        _;
    }

    /**
     * @dev Construtor do contrato
     * @param _itemDescription Descrição do item a ser leiloado
     * @param _biddingTime Duração do leilão em segundos
     */
    constructor(
        string memory _itemDescription,
        uint256 _biddingTime
    ) {
        auctioneer = msg.sender;
        itemDescription = _itemDescription;
        auctionEndTime = block.timestamp + _biddingTime;
        auctionEnded = false;
        winnerRevealed = false;
        
        // Inicializar o lance mais alto com zero
        highestBid = TFHE.asEuint64(0);
        currentWinner = address(0);
    }

    /**
     * @dev Permite que um usuário faça um lance criptografado
     * @param encryptedBid Lance criptografado usando TFHE
     */
    function placeBid(inEuint64 calldata encryptedBid) external auctionActive {
        // Converter o lance de entrada para euint64
        euint64 bidAmount = TFHE.asEuint64(encryptedBid);
        
        // Verificar se o lance é maior que zero
        ebool isValidBid = TFHE.gt(bidAmount, TFHE.asEuint64(0));
        require(TFHE.decrypt(isValidBid), "Lance deve ser maior que zero");
        
        // Se é o primeiro lance ou se o lance é maior que o atual mais alto
        ebool isHigherBid = TFHE.gt(bidAmount, highestBid);
        
        // Atualizar o lance mais alto se necessário
        highestBid = TFHE.select(isHigherBid, bidAmount, highestBid);
        
        // Atualizar o vencedor atual se necessário
        if (TFHE.decrypt(isHigherBid)) {
            currentWinner = msg.sender;
        }
        
        // Armazenar o lance do usuário
        if (!bids[msg.sender].exists) {
            bidders.push(msg.sender);
        }
        
        bids[msg.sender] = Bid({
            amount: bidAmount,
            bidder: msg.sender,
            exists: true
        });
        
        // Permitir que o contrato acesse o lance criptografado
        TFHE.allowThis(bidAmount);
        
        emit BidPlaced(msg.sender, keccak256(abi.encodePacked(msg.sender, block.timestamp)));
    }

    /**
     * @dev Finaliza o leilão (pode ser chamado pelo leiloeiro ou automaticamente após o tempo)
     */
    function endAuction() external {
        require(
            msg.sender == auctioneer || block.timestamp >= auctionEndTime,
            "Apenas o leiloeiro pode finalizar antes do tempo ou qualquer um apos o tempo"
        );
        require(!auctionEnded, "Leilao ja foi finalizado");
        
        auctionEnded = true;
        emit AuctionEnded(block.timestamp);
    }

    /**
     * @dev Revela o vencedor do leilão (descriptografa o lance vencedor)
     * @notice Esta função deve ser chamada por um relayer autorizado
     */
    function revealWinner() external auctionFinished onlyAuctioneer {
        require(!winnerRevealed, "Vencedor ja foi revelado");
        require(currentWinner != address(0), "Nenhum lance valido foi feito");
        
        // Solicitar descriptografia do lance vencedor
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(highestBid);
        
        Gateway.requestDecryption(
            cts,
            this.callbackRevealWinner.selector,
            0,
            block.timestamp + 100,
            false
        );
    }

    /**
     * @dev Callback para processar o resultado da descriptografia
     * @param decryptedValue Valor descriptografado do lance vencedor
     */
    function callbackRevealWinner(
        uint256 /*requestId*/,
        uint256 decryptedValue
    ) external onlyGateway {
        require(!winnerRevealed, "Vencedor ja foi revelado");
        
        winner = currentWinner;
        winningBid = decryptedValue;
        winnerRevealed = true;
        
        emit WinnerRevealed(winner, winningBid);
    }

    /**
     * @dev Permite que o vencedor reivindique o item
     */
    function claimItem() external {
        require(winnerRevealed, "Vencedor ainda nao foi revelado");
        require(msg.sender == winner, "Apenas o vencedor pode reivindicar o item");
        
        // Lógica para transferir o item (implementar conforme necessário)
        // Por exemplo, transferir um NFT ou marcar como entregue
    }

    /**
     * @dev Permite que perdedores recuperem informações sobre seus lances
     * @param bidder Endereço do licitante
     * @return Retorna se o lance existe
     */
    function getBidInfo(address bidder) external view returns (bool) {
        return bids[bidder].exists;
    }

    /**
     * @dev Retorna informações gerais do leilão
     */
    function getAuctionInfo() external view returns (
        address _auctioneer,
        string memory _itemDescription,
        uint256 _auctionEndTime,
        bool _auctionEnded,
        bool _winnerRevealed,
        uint256 _totalBidders
    ) {
        return (
            auctioneer,
            itemDescription,
            auctionEndTime,
            auctionEnded,
            winnerRevealed,
            bidders.length
        );
    }

    /**
     * @dev Retorna a lista de licitantes
     */
    function getBidders() external view returns (address[] memory) {
        return bidders;
    }

    /**
     * @dev Verifica se o leilão ainda está ativo
     */
    function isAuctionActive() external view returns (bool) {
        return block.timestamp < auctionEndTime && !auctionEnded;
    }

    /**
     * @dev Função de emergência para pausar o contrato (apenas o leiloeiro)
     */
    function emergencyStop() external onlyAuctioneer {
        auctionEnded = true;
        emit AuctionEnded(block.timestamp);
    }
}