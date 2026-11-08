import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { mainnet, sepolia, arbitrum, base, polygon } from 'viem/chains';

// Botchain Mainnet definition (Chain ID: 677, Native Token: BOT)
export const botchainMainnet = defineChain({
  id: 677,
  name: 'Botchain Mainnet',
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
  testnet: false,
});

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

// Primary network is botchainMainnet; include common networks so AppKit can detect and switch them
export const networks = [botchainMainnet, botchainTestnet, mainnet, sepolia, arbitrum, base, polygon];

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
  defaultNetwork: botchainMainnet,
  projectId: projectId || '00000000000000000000000000000000',
  metadata: {
    name: 'ChainID Guard',
    description: 'Network configuration inspector for Botchain Mainnet (Chain ID: 677)',
    url: 'https://chainidguard.vercel.app',
    icons: ['https://chainidguard.vercel.app/chainid-guard-logo.png'],
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
