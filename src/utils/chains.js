/**
 * Chain Directory & Helper Metadata
 * Primary target: Botchain Mainnet (Chain ID: 677)
 * Also catalogs Botchain Testnet (968) and well-known EVM networks to detect and display misconfigurations.
 */
export const BOTCHAIN_MAINNET = {
  id: 677,
  name: 'Botchain Mainnet',
  symbol: 'BOT',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotchainScan',
      url: 'https://scan.botchain.ai',
    },
  },
  rpc: 'https://rpc.botchain.ai',
  explorer: 'https://scan.botchain.ai',
  testnet: false,
  isTestnet: false,
  isPrimary: true,
};

export const BOTCHAIN_TESTNET = {
  id: 968,
  name: 'Botchain Testnet',
  symbol: 'BOT',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  rpc: 'https://rpc.bohr.life',
  explorer: 'https://scan.bohr.life',
  testnet: true,
  isTestnet: true,
  isPrimary: false,
};

export const POPULAR_CHAINS = [
  BOTCHAIN_MAINNET,
  BOTCHAIN_TESTNET,
  { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH', isTestnet: false, rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
  { id: 11155111, name: 'Sepolia Testnet', symbol: 'ETH', isTestnet: true, rpc: 'https://rpc.sepolia.org', explorer: 'https://sepolia.etherscan.io' },
  { id: 8453, name: 'Base Mainnet', symbol: 'ETH', isTestnet: false, rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org' },
  { id: 42161, name: 'Arbitrum One', symbol: 'ETH', isTestnet: false, rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
  { id: 137, name: 'Polygon PoS', symbol: 'POL', isTestnet: false, rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
  { id: 31337, name: 'Localhost / Hardhat', symbol: 'ETH', isTestnet: true, rpc: 'http://127.0.0.1:8545', explorer: '' },
];

export function getChainInfo(chainId) {
  if (!chainId) return null;
  const numId = Number(chainId);
  const found = POPULAR_CHAINS.find((c) => c.id === numId);
  if (found) return found;

  return {
    id: numId,
    name: `Unknown Chain (${numId})`,
    symbol: '???',
    isTestnet: false,
    rpc: '',
    explorer: '',
  };
}
