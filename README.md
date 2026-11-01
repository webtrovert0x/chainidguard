# 🛡️ ChainID Guard

**Network Configuration Inspection & Runtime Verification Protocol**

> Eliminate accidental cross-network deployments. Verify that your wallet provider, custom RPC endpoint, and on-chain contract execution environment are targeting the exact expected blockchain.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network: Botchain Testnet](https://img.shields.io/badge/Network-Botchain%20Testnet-0066FF.svg)](https://scan.bohr.life)
[![Chain ID: 968](https://img.shields.io/badge/Chain%20ID-968-blue.svg)](https://scan.bohr.life)

---

## 📖 Overview

Developers often inadvertently deploy or interact with smart contracts on the wrong network due to mismatched wallet settings, desynchronized RPC endpoints, or incorrect framework configuration. In worst-case scenarios, this results in irreversible loss of mainnet funds or testnet contamination.

**ChainID Guard** is an end-to-end verification system combining:
1. **4-Way Verification Matrix**: Compares **Expected Chain ID**, **Connected Wallet Chain ID**, **RPC-Reported Chain ID**, and **On-Chain Runtime (`block.chainid`)**.
2. **`ChainIDGuard.sol`**: An on-chain smart contract that records inspection requests and validates execution context using `block.chainid` (EIP-1344).
3. **Safety Warning Engine**: Detects critical Mainnet-vs-Testnet hazards and RPC desynchronization with one-click network switching.
4. **Gas Fee Only**: All contract interactions require zero protocol fees—strictly standard network gas fees only.

For comprehensive technical analysis and mathematical threat modeling, see the [WHITEPAPER.md](./WHITEPAPER.md).

---

## 🌐 Botchain Testnet Deployment

ChainID Guard is deployed on **Botchain Testnet**:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **Native Token** | `BOT` (18 Decimals) |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Block Explorer** | [scan.bohr.life](https://scan.bohr.life) |
| **Deployed Contract** | [`0x828a2a7a65f67AC30A7Ecc1d5f466fc28532Fe5E`](https://scan.bohr.life/address/0x828a2a7a65f67AC30A7Ecc1d5f466fc28532Fe5E) |

---

## ⚡ Key Features

- **Wallet Connection**: Powered by `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`, and `@tanstack/react-query`.
- **4-Way Comparison Matrix**:
  - **Expected Chain ID**: Pre-configured for Botchain Testnet (`968`), with comparison presets for Ethereum Mainnet, Sepolia, Base, Arbitrum, Polygon, and Hardhat.
  - **Connected Wallet Chain ID**: Real-time detection from injected or mobile providers.
  - **RPC-Reported Chain ID**: Custom RPC input (defaults to `https://rpc.bohr.life`) with live latency and health probing via `eth_chainId`.
  - **On-Chain Runtime**: Ground-truth confirmation executed directly through `block.chainid`.
- **Configuration Warnings**:
  - 🚨 **Critical Hazard Alert**: Flags when a wallet is connected to a real-value Mainnet while expecting a Testnet.
  - ⚠️ **RPC Desync Alert**: Warns when the custom RPC points to a different chain than the target.
- **On-Chain Record Inspection**: Look up past inspection requests and results using `getRequest(requestId)` or re-publish using `publishResult(requestId)`.

---

## 🏗️ Smart Contract Architecture (`ChainIDGuard.sol`)

```solidity
function requestNetworkCheck(uint256 expectedChainId) external returns (uint256 requestId);
function publishResult(uint256 requestId) external returns (CheckResult memory);
function getRequest(uint256 requestId) external view returns (CheckRequest memory, CheckResult memory);
function getCurrentChainId() external view returns (uint256);
function getUserRequests(address user) external view returns (uint256[] memory);
```

- **Non-payable**: Pure gas fee only ($msg.value == 0$).
- **Storage**: Mappings for requests and results indexed by auto-incrementing `requestNonce`.
- **Events**:
  - `NetworkCheckRequested(uint256 indexed requestId, address indexed requester, uint256 expectedChainId, uint256 actualChainId, uint256 timestamp)`
  - `NetworkCheckCompleted(uint256 indexed requestId, address indexed requester, uint256 expectedChainId, uint256 actualChainId, bool isMatch, uint256 timestamp)`

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/webtrovert0x/chainidguard.git
cd chainidguard
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
REOWN_ID=your_reown_project_id_here
CONTRACT_ADDRESS=0x828a2a7a65f67AC30A7Ecc1d5f466fc28532Fe5E
```

> **Note**: Vite is configured to read `REOWN_ID` directly without requiring the public `VITE_` prefix.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Smart Contract Tests

```bash
npm test
```

### 5. Deploy to Botchain Testnet

```bash
npm run deploy:botchain
```

---

## 🎨 UI & Design

The application features a **White and Blue** color palette designed for high contrast and developer ergonomics:
- Primary Blue accents (`#2563eb`) with soft slate backgrounds (`#f8fafc`).
- Distinct status badges for matched configurations, partial mismatches, and critical hazards.
- Fully responsive on desktop and mobile.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
