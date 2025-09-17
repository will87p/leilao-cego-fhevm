const { FhevmInstance } = require("fhevmjs");

/**
 * Cria instâncias FHEVM para cada signer
 * @param {string} contractAddress - Endereço do contrato
 * @param {object} ethers - Objeto ethers do Hardhat
 * @param {object} signers - Objeto com os signers
 * @returns {object} Objeto com instâncias para cada signer
 */
async function createInstances(contractAddress, ethers, signers) {
  // Obter informações da rede
  const network = await ethers.provider.getNetwork();
  const chainId = +network.chainId.toString();
  
  // URL do gateway (ajustar conforme a rede)
  const gatewayUrl = process.env.FHEVM_GATEWAY_URL || "https://gateway.devnet.zama.ai";
  
  const instances = {};
  
  // Criar instância para Alice (auctioneer)
  if (signers.alice) {
    instances.alice = await FhevmInstance.create({
      chainId,
      networkUrl: ethers.provider.connection?.url || "http://localhost:8545",
      gatewayUrl,
      aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92", // Endereço ACL padrão
    });
    
    // Gerar keypair para Alice
    instances.alice.generateKeypair();
  }
  
  // Criar instância para Bob (bidder1)
  if (signers.bob) {
    instances.bob = await FhevmInstance.create({
      chainId,
      networkUrl: ethers.provider.connection?.url || "http://localhost:8545",
      gatewayUrl,
      aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
    });
    
    instances.bob.generateKeypair();
  }
  
  // Criar instância para Carol (bidder2)
  if (signers.carol) {
    instances.carol = await FhevmInstance.create({
      chainId,
      networkUrl: ethers.provider.connection?.url || "http://localhost:8545",
      gatewayUrl,
      aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
    });
    
    instances.carol.generateKeypair();
  }
  
  // Criar instância para Dave (bidder3)
  if (signers.dave) {
    instances.dave = await FhevmInstance.create({
      chainId,
      networkUrl: ethers.provider.connection?.url || "http://localhost:8545",
      gatewayUrl,
      aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
    });
    
    instances.dave.generateKeypair();
  }
  
  return instances;
}

/**
 * Cria uma instância FHEVM para um signer específico
 * @param {string} contractAddress - Endereço do contrato
 * @param {object} ethers - Objeto ethers do Hardhat
 * @param {object} signer - Signer específico
 * @returns {object} Instância FHEVM
 */
async function createInstance(contractAddress, ethers, signer) {
  const network = await ethers.provider.getNetwork();
  const chainId = +network.chainId.toString();
  
  const gatewayUrl = process.env.FHEVM_GATEWAY_URL || "https://gateway.devnet.zama.ai";
  
  const instance = await FhevmInstance.create({
    chainId,
    networkUrl: ethers.provider.connection?.url || "http://localhost:8545",
    gatewayUrl,
    aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
  });
  
  instance.generateKeypair();
  
  return instance;
}

module.exports = {
  createInstances,
  createInstance,
};