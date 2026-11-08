import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import NetworkMatrix from './components/NetworkMatrix';
import WarningBanner from './components/WarningBanner';
import InspectForm from './components/InspectForm';
import HistoryLog from './components/HistoryLog';
import { probeRpcEndpoint } from './utils/rpc';
import { ShieldCheck, Info, CheckCircle, ExternalLink, Globe, Compass, Cpu, Layers } from 'lucide-react';

export default function App() {
  const { chain } = useAccount();

  // Baseline target: Default is 677 (Botchain Mainnet)
  const [expectedChainId, setExpectedChainId] = useState('677');
  const [rpcUrl, setRpcUrl] = useState('https://rpc.botchain.ai');

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
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-slate-900 shrink-0 hidden sm:block">
              <img src="/chainid-guard-logo.png" alt="ChainID Guard Logo" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/30 text-blue-100 border border-blue-400/30">
                  Network Pre-flight Inspection
                </span>
                <span className="text-blue-200 text-xs flex items-center gap-1">
                  • <img src="/botchain-logo.png" alt="BOT Chain" className="w-3 h-3 object-contain inline" /> Botchain Mainnet (677)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ChainID Guard
              </h1>
              <p className="text-blue-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Eliminate accidental cross-network deployments. Verify that your wallet provider, custom RPC endpoint, and on-chain contract execution environment are targeting the exact expected blockchain.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <img src="/botchain-logo.png" alt="BOT Chain" className="w-4 h-4 object-contain" />
              <span>BotchainScan Explorer</span>
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

        {/* BOT Chain Ecosystem Showcase Section */}
        <section className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 p-1.5 flex items-center justify-center shadow-sm shrink-0">
                <img src="/botchain-logo.png" alt="BOT Chain Official Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">BOT Chain Ecosystem</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Mainnet (Chain ID: 677)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ChainID Guard is built on and verified for the high-performance BOT Chain network.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <img src="/chainid-guard-logo.png" alt="ChainID Guard Logo" className="w-5 h-5 rounded-md object-contain" />
              <span className="text-xs font-semibold text-blue-900">Protected by ChainID Guard</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Link 1: BOT Chain Website with Official Logo in front */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-blue-200/80 p-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <img src="/botchain-logo.png" alt="BOT Chain Official Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block">
                    Official Portal
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    BOT Chain Website
                  </span>
                  <span className="text-xs text-slate-400 block font-mono">
                    https://botchain.ai
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>

            {/* Link 2: BOT Chain Explorer with Official Logo in front */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-blue-200/80 p-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <img src="/botchain-logo.png" alt="BOT Chain Official Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block">
                    Official Block Explorer
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    BOT Chain Explorer
                  </span>
                  <span className="text-xs text-slate-400 block font-mono">
                    https://scan.botchain.ai
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Network with ChainID Guard Logo */}
          <div className="flex items-center space-x-2.5">
            <img src="/chainid-guard-logo.png" alt="ChainID Guard Logo" className="w-6 h-6 rounded-md object-contain border border-blue-200" />
            <span className="font-bold text-slate-800">ChainID Guard</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <img src="/botchain-logo.png" alt="BOT Chain" className="w-3.5 h-3.5 object-contain inline" />
              BOT Chain Mainnet (Chain ID: 677)
            </span>
          </div>

          {/* Ecosystem Links with BOT Chain Official Logo in front */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="text-slate-400">Powered by BOT Chain</span>
            <span className="text-slate-300">•</span>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1.5"
            >
              <img src="/botchain-logo.png" alt="BOT Chain" className="w-3.5 h-3.5 object-contain" />
              <span>BOT Chain Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1.5"
            >
              <img src="/botchain-logo.png" alt="BOT Chain" className="w-3.5 h-3.5 object-contain" />
              <span>BOT Chain Explorer</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Gas & Fee Notice */}
          <div className="text-slate-400 text-[11px] flex items-center justify-center gap-2">
            <span>Verified Smart Contract • Zero Protocol Fee (Gas Only)</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
