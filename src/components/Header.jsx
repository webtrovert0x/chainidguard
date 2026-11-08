import React from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { ShieldCheck, Wallet, ExternalLink, LogOut, Cpu, ArrowRightLeft } from 'lucide-react';

export default function Header() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();

  const isBotchain = chain?.id === 677;

  return (
    <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Target Network */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 border border-blue-200/80 bg-slate-900 flex items-center justify-center">
            <img src="/chainid-guard-logo.png" alt="ChainID Guard Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ChainID Guard</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Mainnet
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center space-x-1.5">
              <span>Target:</span>
              <img src="/botchain-logo.png" alt="BOT Chain" className="w-3.5 h-3.5 object-contain" />
              <span className="font-medium text-blue-600">Botchain Mainnet (Chain ID 677)</span>
              <span className="text-slate-300">•</span>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-0.5"
              >
                Explorer <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>

        {/* Right Action: Wallet & Network Indicator */}
        <div className="flex items-center space-x-3">
          {isConnected && chain && (
            <button
              onClick={() => {
                if (!isBotchain && switchChain) {
                  switchChain({ chainId: 677 });
                }
              }}
              title={isBotchain ? 'Connected to Botchain Mainnet' : 'Click to switch to Botchain Mainnet (677)'}
              className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isBotchain
                  ? 'bg-blue-50/70 border-blue-200 text-blue-700 cursor-default'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 cursor-pointer shadow-sm hover:scale-[1.02]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isBotchain ? 'bg-blue-600 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              <span>{chain.name || `Chain ${chain.id}`}</span>
              <span className="text-slate-400 font-mono">({chain.id})</span>
              {!isBotchain && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <ArrowRightLeft className="w-2.5 h-2.5" /> Switch to Mainnet 677
                </span>
              )}
            </button>
          )}

          {isConnected ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => open()}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-mono">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                </span>
              </button>
              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
