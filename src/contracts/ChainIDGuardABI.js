import deploymentData from './ChainIDGuard.json';

export const CHAIN_ID_GUARD_ABI = deploymentData.abi;
export const DEFAULT_CONTRACT_ADDRESS = deploymentData.address || (typeof process !== 'undefined' && process.env?.CONTRACT_ADDRESS) || "";
