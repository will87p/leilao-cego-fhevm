const { ethers } = require("hardhat");

/**
 * Obtém os signers nomeados para uso nos testes
 * @returns {object} Objeto com signers nomeados
 */
async function getSigners() {
  const signers = await ethers.getSigners();
  
  // Verificar se temos signers suficientes
  if (signers.length < 4) {
    throw new Error("Pelo menos 4 signers são necessários para os testes");
  }
  
  return {
    alice: signers[0],   // Leiloeiro
    bob: signers[1],     // Licitante 1
    carol: signers[2],   // Licitante 2
    dave: signers[3],    // Licitante 3
    eve: signers[4],     // Licitante adicional (se disponível)
  };
}

/**
 * Obtém um signer específico por índice
 * @param {number} index - Índice do signer
 * @returns {object} Signer
 */
async function getSigner(index) {
  const signers = await ethers.getSigners();
  
  if (index >= signers.length) {
    throw new Error(`Signer no índice ${index} não está disponível`);
  }
  
  return signers[index];
}

/**
 * Obtém todos os signers disponíveis
 * @returns {array} Array com todos os signers
 */
async function getAllSigners() {
  return await ethers.getSigners();
}

/**
 * Obtém informações dos signers (endereços e balances)
 * @returns {array} Array com informações dos signers
 */
async function getSignersInfo() {
  const signers = await ethers.getSigners();
  const signersInfo = [];
  
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    const address = await signer.getAddress();
    const balance = await ethers.provider.getBalance(address);
    
    signersInfo.push({
      index: i,
      address,
      balance: ethers.formatEther(balance),
      signer,
    });
  }
  
  return signersInfo;
}

module.exports = {
  getSigners,
  getSigner,
  getAllSigners,
  getSignersInfo,
};