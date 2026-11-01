import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import NetworkMatrix from './components/NetworkMatrix';
import WarningBanner from './components/WarningBanner';
import InspectForm from './components/InspectForm';
import HistoryLog from './components/HistoryLog';
import { probeRpcEndpoint } from './utils/rpc';
import { ShieldCheck, Info, CheckCircle, ExternalLink, Terminal } from 'lucide-react';

export default function App() {
  const { chain } = useAccount();

  // Baseline target: Default is 968 (Botchain Testnet)
  const [expectedChainId, setExpectedChainId] = useState('968');
  const [rpcUrl, setRpcUrl] = useState('https://rpc.bohr.life');

  // RPC Probe State
  const [rpcChainId, setRpcChainId] = useState(null);
  const [rpcLoading, setRpcLoading] = useState(false);
  const [rpcError, setRpcError] = useState(null);
  const [rpcLatency, setRpcLatency] = useState(0);

  // Contract On-Chain block.chainid State
  const [onChainChainId, setOnChainChainId] = useState(null);

  // Inspection History Log
  const [history, setHistory] = useState([]);

  // Auto-probe RPC on URL change or mount
  const handleProbeRpc = useCallback(async (targetUrl) => {
    if (!targetUrl) return;
    setRpcLoading(true);
    setRpcError(null);

    const result = await probeRpcEndpoint(targetUrl);
    setRpcLoading(false);
    setRpcLatency(result.latencyMs);

    if (result.error) {
      setRpcError(result.error);
      setRpcChainId(null);
    } else {
      setRpcChainId(result.chainId);
      setRpcError(null);
    }
  }, []);

  useEffect(() => {
    handleProbeRpc(rpcUrl);
  }, [rpcUrl, handleProbeRpc]);

  // When inspection transaction finishes
  const handleTxCompleted = (result, txHash) => {
    setOnChainChainId(result.actualChainId);
    setHistory((prev) => [
      {
        ...result,
        txHash,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Hero Title & Subtext */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/30 text-blue-100 border border-blue-400/30">
                Network Pre-flight Inspection
              </span>
              <span className="text-blue-200 text-xs">• Botchain Testnet (968)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ChainID Guard
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Eliminate accidental cross-network deployments. Verify that your wallet provider, custom RPC endpoint, and on-chain contract execution environment are targeting the exact expected blockchain.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>BohrScan Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Warning & Safety Alerts */}
        <WarningBanner
          expectedChainId={expectedChainId}
          walletChainId={chain?.id}
          rpcChainId={rpcChainId}
          rpcError={rpcError}
        />

        {/* 4-Way Verification Matrix */}
        <NetworkMatrix
          expectedChainId={expectedChainId}
          walletChainId={chain?.id}
          rpcChainId={rpcChainId}
          onChainChainId={onChainChainId}
          rpcLoading={rpcLoading}
          rpcError={rpcError}
        />

        {/* Inspection Configuration Form & Transaction Trigger */}
        <InspectForm
          expectedChainId={expectedChainId}
          setExpectedChainId={setExpectedChainId}
          rpcUrl={rpcUrl}
          setRpcUrl={setRpcUrl}
          probeRpc={handleProbeRpc}
          rpcLoading={rpcLoading}
          rpcLatency={rpcLatency}
          onTxCompleted={handleTxCompleted}
        />

        {/* On-Chain Lookup & Session History */}
        <HistoryLog history={history} />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">ChainID Guard</span>
            <span>•</span>
            <span>Botchain Testnet (Chain ID: 968)</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Free • Gas Fee Only</span>
            <span>•</span>
            <a href="https://scan.bohr.life" target="_blank" rel="noreferrer" className="hover:text-blue-600">
              scan.bohr.life
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

