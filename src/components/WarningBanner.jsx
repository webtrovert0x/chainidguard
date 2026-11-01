import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { getChainInfo } from '../utils/chains';
import { useSwitchChain } from 'wagmi';

export default function WarningBanner({
  expectedChainId,
  walletChainId,
  rpcChainId,
  rpcError,
}) {
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const expectedNum = Number(expectedChainId);
  const walletNum = walletChainId ? Number(walletChainId) : null;
  const rpcNum = rpcChainId ? Number(rpcChainId) : null;

  const expectedInfo = getChainInfo(expectedNum);
  const walletInfo = walletNum ? getChainInfo(walletNum) : null;
  const rpcInfo = rpcNum ? getChainInfo(rpcNum) : null;

  const warnings = [];

  // Check 1: Disconnected
  if (walletNum === null) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Connect your Web3 Wallet to begin verification</p>
          <p className="text-blue-700 text-xs mt-0.5">
            ChainID Guard will inspect whether your wallet network, RPC configuration, and smart contract execution match your expected target (<strong>{expectedInfo?.name || `Chain ID ${expectedNum}`}</strong>).
          </p>
        </div>
      </div>
    );
  }

  // Check 2: High Financial Risk (Wallet is on Mainnet, but Expected is a Testnet)
  if (walletInfo && !walletInfo.isTestnet && expectedInfo && expectedInfo.isTestnet) {
    warnings.push({
      level: 'critical',
      title: '🚨 CRITICAL: Mainnet Execution Hazard Detected',
      message: `Your wallet is currently connected to ${walletInfo.name} (Chain ID: ${walletNum}), which is a real-value MAINNET. However, your expected target is a TESTNET (${expectedInfo.name}, Chain ID: ${expectedNum}). Any transaction could inadvertently spend real assets!`,
      action: () => switchChain && switchChain({ chainId: expectedNum }),
      actionLabel: `Switch to ${expectedInfo.name} (${expectedNum})`,
    });
  }

  // Check 3: Wallet does NOT match Expected
  if (walletNum !== expectedNum) {
    warnings.push({
      level: 'danger',
      title: 'Wallet Network Mismatch',
      message: `Your wallet is connected to ${walletInfo?.name || `Chain ${walletNum}`} (ID: ${walletNum}), but your expected target is ${expectedInfo?.name || `Chain ${expectedNum}`} (ID: ${expectedNum}).`,
      action: () => switchChain && switchChain({ chainId: expectedNum }),
      actionLabel: `Switch Wallet to ${expectedInfo?.name || `Chain ${expectedNum}`}`,
    });
  }

  // Check 4: RPC Endpoint does NOT match Expected
  if (rpcNum !== null && rpcNum !== expectedNum) {
    warnings.push({
      level: 'warning',
      title: 'RPC Provider Desynchronization',
      message: `The configured RPC endpoint returned Chain ID ${rpcNum} (${rpcInfo?.name || 'Unknown'}), but your target is ${expectedNum} (${expectedInfo?.name || 'Target'}). Calls through this RPC will query or simulate against the wrong blockchain!`,
    });
  }

  // Check 5: RPC Probing Error
  if (rpcError) {
    warnings.push({
      level: 'warning',
      title: 'RPC Probing Error',
      message: `Could not verify RPC endpoint: ${rpcError}. Check RPC URL formatting and network access.`,
    });
  }

  // If no warnings, render all clear confirmation
  if (warnings.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-emerald-900">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">All Environment Layers Synchronized ({expectedInfo?.name || `Chain ${expectedNum}`})</p>
          <p className="text-emerald-700 text-xs mt-0.5">
            Your connected wallet and custom RPC both target {expectedInfo?.name || `Chain ID ${expectedNum}`}. Ready for safe interaction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((w, idx) => (
        <div
          key={idx}
          className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
            w.level === 'critical'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : w.level === 'danger'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-yellow-50 border-yellow-200 text-yellow-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            {w.level === 'critical' ? (
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm tracking-tight">{w.title}</h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{w.message}</p>
            </div>
          </div>

          {w.action && (
            <button
              onClick={w.action}
              disabled={isSwitching}
              className="self-start sm:self-center shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              {isSwitching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{w.actionLabel}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
