import React from 'react';
import { useSwitchChain } from 'wagmi';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight, ShieldCheck, Server, Wallet, Layers, ArrowRightLeft } from 'lucide-react';
import { getChainInfo } from '../utils/chains';

export default function NetworkMatrix({
  expectedChainId,
  walletChainId,
  rpcChainId,
  onChainChainId,
  rpcLoading,
  rpcError,
}) {
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const expectedNum = Number(expectedChainId);
  const walletNum = walletChainId ? Number(walletChainId) : null;
  const rpcNum = rpcChainId ? Number(rpcChainId) : null;
  const onChainNum = onChainChainId ? Number(onChainChainId) : null;

  const expectedInfo = getChainInfo(expectedNum);
  const walletInfo = walletNum ? getChainInfo(walletNum) : null;
  const rpcInfo = rpcNum ? getChainInfo(rpcNum) : null;
  const onChainInfo = onChainNum ? getChainInfo(onChainNum) : null;

  // Comparison logic
  const walletMatchesExpected = walletNum !== null && walletNum === expectedNum;
  const rpcMatchesExpected = rpcNum !== null && rpcNum === expectedNum;
  const onChainMatchesExpected = onChainNum !== null && onChainNum === expectedNum;

  // Overall status
  const allKnownMatch =
    walletMatchesExpected &&
    (rpcNum === null || rpcMatchesExpected) &&
    (onChainNum === null || onChainMatchesExpected);

  const hasCriticalMismatch =
    (walletNum !== null && !walletMatchesExpected) ||
    (rpcNum !== null && !rpcMatchesExpected) ||
    (onChainNum !== null && !onChainMatchesExpected);

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Network Verification Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cross-comparison of expected deployment target vs observed environment layers.
          </p>
        </div>

        {/* Global Match Badge */}
        <div>
          {walletNum === null ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Awaiting Wallet Connection</span>
            </span>
          ) : allKnownMatch ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Configurations Synchronized</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Configuration Mismatch Detected</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        
        {/* 1. Expected Target */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Expected Target
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200/60 text-blue-900">
              Baseline
            </span>
          </div>

          <div className="text-2xl font-mono font-extrabold text-blue-950 mt-1">
            {expectedNum || '---'}
          </div>

          <div className="mt-2 text-xs text-blue-800 font-medium truncate">
            {expectedInfo?.name || 'Custom Target'}
          </div>
          <div className="text-[11px] text-blue-600/80 font-mono mt-0.5">
            0x{expectedNum.toString(16)}
          </div>
        </div>

        {/* 2. Connected Wallet */}
        <div className={`p-4 rounded-xl border transition-all ${
          walletNum === null
            ? 'bg-slate-50 border-slate-200'
            : walletMatchesExpected
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-rose-50/60 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              Connected Wallet
            </span>
            {walletNum === null ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                Disconnected
              </span>
            ) : walletMatchesExpected ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Match
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1">
                <XCircle className="w-2.5 h-2.5" /> Mismatch
              </span>
            )}
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1">
            {walletNum !== null ? walletNum : '---'}
          </div>

          <div className="mt-2 text-xs text-slate-700 font-medium truncate">
            {walletInfo ? walletInfo.name : 'Not connected'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {walletNum !== null ? `0x${walletNum.toString(16)}` : 'Awaiting provider'}
          </div>

          {walletNum !== null && !walletMatchesExpected && switchChain && (
            <button
              onClick={() => switchChain({ chainId: expectedNum })}
              disabled={isSwitching}
              className="mt-2 w-full py-1 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowRightLeft className={`w-3 h-3 ${isSwitching ? 'animate-spin' : ''}`} />
              <span>Switch to {expectedNum}</span>
            </button>
          )}
        </div>

        {/* 3. RPC-Reported */}
        <div className={`p-4 rounded-xl border transition-all ${
          rpcLoading
            ? 'bg-blue-50/30 border-blue-200 animate-pulse'
            : rpcError
            ? 'bg-amber-50/60 border-amber-200'
            : rpcMatchesExpected
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-rose-50/60 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              RPC Endpoint
            </span>
            {rpcLoading ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Probing...
              </span>
            ) : rpcError ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Error
              </span>
            ) : rpcMatchesExpected ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Match
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1">
                <XCircle className="w-2.5 h-2.5" /> Mismatch
              </span>
            )}
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1">
            {rpcLoading ? '...' : rpcNum !== null ? rpcNum : '---'}
          </div>

          <div className="mt-2 text-xs text-slate-700 font-medium truncate">
            {rpcError ? rpcError : rpcInfo ? rpcInfo.name : 'Unknown RPC'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
            {rpcNum !== null ? `0x${rpcNum.toString(16)}` : 'JSON-RPC response'}
          </div>
        </div>

        {/* 4. On-Chain Execution (block.chainid) */}
        <div className={`p-4 rounded-xl border transition-all ${
          onChainNum === null
            ? 'bg-slate-50 border-slate-200'
            : onChainMatchesExpected
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-rose-50/60 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              On-Chain Runtime
            </span>
            {onChainNum === null ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                Untested
              </span>
            ) : onChainMatchesExpected ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Match
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1">
                <XCircle className="w-2.5 h-2.5" /> Mismatch
              </span>
            )}
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1">
            {onChainNum !== null ? onChainNum : '---'}
          </div>

          <div className="mt-2 text-xs text-slate-700 font-medium truncate">
            {onChainInfo ? onChainInfo.name : onChainNum !== null ? `Chain ${onChainNum}` : 'Submit inspection tx'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {onChainNum !== null ? `block.chainid: ${onChainNum}` : 'Verified via contract'}
          </div>
        </div>

      </div>
    </div>
  );
}

