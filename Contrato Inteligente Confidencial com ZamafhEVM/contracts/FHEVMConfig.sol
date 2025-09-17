// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEVMConfig
 * @dev Contrato de configuração para FHEVM
 * @notice Este contrato herda as configurações necessárias para FHEVM
 */
abstract contract FHEVMConfig {
    constructor() {
        // Inicializar TFHE se necessário
        TFHE.setFHEVM(FHEVMConfig.defaultFHEVMConfigStruct());
    }

    /**
     * @dev Retorna a configuração padrão para FHEVM
     */
    function defaultFHEVMConfigStruct() internal pure returns (TFHEExecutor.FHEVMConfig memory) {
        return TFHEExecutor.FHEVMConfig({
            ACLAddress: address(0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92),
            TFHEExecutorAddress: address(0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c),
            FHEPaymentAddress: address(0xFb03BE574d14C256D56F09a198B586bdfc0A9de2),
            KMSVerifierAddress: address(0x9D6891A6240D6130c54ae243d8005063D05fE14b)
        });
    }
}