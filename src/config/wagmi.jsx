import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { mainnet, sepolia, arbitrum, base, polygon } from 'viem/chains';

// Botchain Testnet definition (Chain ID: 968, Native Token: BOT)
export const botchainTestnet = defineChain({
  id: 968,
  name: 'Botchain Testnet',
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
  testnet: true,
});

// Primary network is botchainTestnet; include common networks so AppKit can detect and switch them
export const networks = [botchainTestnet, mainnet, sepolia, arbitrum, base, polygon];

// Read strictly from REOWN_ID as requested
export const projectId = (typeof process !== 'undefined' && process.env && process.env.REOWN_ID)
  ? process.env.REOWN_ID
  : '';

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || '00000000000000000000000000000000',
  networks,
});

// Initialize Reown AppKit Modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: botchainTestnet,
  projectId: projectId || '00000000000000000000000000000000',
  metadata: {
    name: 'ChainID Guard',
    description: 'Network configuration inspector for Botchain Testnet',
    url: 'https://scan.bohr.life',
    icons: ['https://scan.bohr.life/favicon.ico'],
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#2563eb', // Clean blue accent
    '--w3m-color-mix': '#eff6ff',
    '--w3m-color-mix-strength': 15,
    '--w3m-border-radius-master': '8px',
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
