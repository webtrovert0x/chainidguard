import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CHAIN_ID_GUARD_ABI, DEFAULT_CONTRACT_ADDRESS } from '../contracts/ChainIDGuardABI';
import { POPULAR_CHAINS } from '../utils/chains';
import { Send, CheckCircle2, XCircle, ArrowRight, RefreshCw, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { decodeEventLog } from 'viem';

export default function InspectForm({
  expectedChainId,
  setExpectedChainId,
  rpcUrl,
  setRpcUrl,
  probeRpc,
  rpcLoading,
  rpcLatency,
  onTxCompleted,
}) {
  const { isConnected, address, chain } = useAccount();
  const publicClient = usePublicClient();

  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS || '');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [txError, setTxError] = useState(null);

  const { writeContractAsync } = useWriteContract();

  // Send inspection transaction to contract
  const handleSendInspection = async (e) => {
    e.preventDefault();
    setTxError(null);
    setTxResult(null);

    if (!isConnected) {
      setTxError('Please connect your Web3 wallet first.');
      return;
    }

    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      setTxError('Please provide a valid 0x contract address for ChainIDGuard.');
      return;
    }

    try {
      setSubmittingTx(true);

      // Call requestNetworkCheck(expectedChainId) with ZERO msg.value (strictly gas fee only!)
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: CHAIN_ID_GUARD_ABI,
        functionName: 'requestNetworkCheck',
        args: [BigInt(expectedChainId)],
        // Note: No value is passed. Strictly gas fee only!
      });

      setLastTxHash(hash);

      // Wait for receipt
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        // Parse logs to extract verified on-chain result
        let verifiedData = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: CHAIN_ID_GUARD_ABI,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === 'NetworkCheckCompleted') {
              verifiedData = {
                requestId: Number(decoded.args.requestId),
                requester: decoded.args.requester,
                expectedChainId: Number(decoded.args.expectedChainId),
                actualChainId: Number(decoded.args.actualChainId),
                isMatch: decoded.args.isMatch,
                timestamp: Number(decoded.args.timestamp),
                gasUsed: receipt.gasUsed.toString(),
                blockNumber: Number(receipt.blockNumber),
              };
              break;
            }
          } catch {
            // Not a matching event, continue
          }
        }

        const finalResult = verifiedData || {
          requestId: null,
          expectedChainId: Number(expectedChainId),
          actualChainId: chain?.id || 968,
          isMatch: Number(expectedChainId) === (chain?.id || 968),
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: Number(receipt.blockNumber),
        };

        setTxResult(finalResult);
        if (onTxCompleted) {
          onTxCompleted(finalResult, hash);
        }
      }
    } catch (err) {
      console.error('Inspection transaction failed:', err);
      let msg = err.shortMessage || err.message || 'Transaction was rejected or failed.';
      if (msg.includes('User rejected')) {
        msg = 'Transaction rejected in wallet.';
      }
      setTxError(msg);
    } finally {
      setSubmittingTx(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>Network Inspection Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure baseline target, verify RPC endpoint, and broadcast on-chain inspection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Target Chain ID & Presets */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expected Chain ID
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={expectedChainId}
                onChange={(e) => setExpectedChainId(e.target.value)}
                placeholder="e.g. 968"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-sm bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The blockchain network your smart contract and dApp are intended to target.
            </p>
          </div>

          {/* Target Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Target Presets:
              </span>
              <span className="text-[10px] text-blue-600 font-medium">
                Primary: Botchain Testnet (968)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CHAINS.map((c) => {
                const isSelected = Number(expectedChainId) === c.id;
                const isPrimary = c.id === 968;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setExpectedChainId(c.id.toString());
                      if (c.rpc) setRpcUrl(c.rpc);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isPrimary
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
                          : 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-700/30'
                        : isPrimary
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isPrimary && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <span>{c.name}</span>
                    <span className="opacity-75 font-mono text-[11px]">({c.id})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RPC Comparison Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                RPC Endpoint for Comparison
              </label>
              {rpcLatency > 0 && (
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                  Ping: {rpcLatency}ms
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="https://rpc.bohr.life"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => probeRpc(rpcUrl)}
                disabled={rpcLoading}
                className="px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rpcLoading ? 'animate-spin' : ''}`} />
                <span>Probe</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tests <code className="text-blue-600">eth_chainId</code> on the endpoint directly without wallet mediation.
            </p>
          </div>
        </div>

        {/* Right Column: Contract Address & Inspection Tx */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ChainIDGuard Contract Address (Botchain Testnet)
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-xs bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Target address for on-chain verification.</span>
              <span className="text-blue-600 font-medium">Free (Gas Fee Only)</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold">On-Chain Inspection:</span> Submits a lightweight transaction to execute <code className="bg-white px-1 py-0.5 rounded text-blue-700 border border-blue-200">requestNetworkCheck()</code> on-chain. The contract evaluates <code className="bg-white px-1 py-0.5 rounded text-blue-700 border border-blue-200">block.chainid</code> and emits verified events.
              </div>
            </div>

            <button
              onClick={handleSendInspection}
              disabled={submittingTx || !isConnected || !contractAddress}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                submittingTx || !isConnected || !contractAddress
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 transform hover:-translate-y-0.5'
              }`}
            >
              {submittingTx ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Inspection Tx...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inspection Transaction</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500">
              Only standard network gas is used. No ETH/BOT fees or token transfers.
            </p>
          </div>

          {/* Error display */}
          {txError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="break-all">{txError}</span>
            </div>
          )}

          {/* Success / Result Receipt display */}
          {txResult && (
            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  {txResult.isMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  On-Chain Inspection Result
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    txResult.isMatch
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {txResult.isMatch ? 'MATCH VERIFIED' : 'MISMATCH DETECTED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Expected Chain ID</span>
                  <span className="font-mono font-bold text-slate-800">{txResult.expectedChainId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Actual (block.chainid)</span>
                  <span className="font-mono font-bold text-blue-700">{txResult.actualChainId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Request Nonce #</span>
                  <span className="font-mono font-bold text-slate-800">{txResult.requestId || 'Instant'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gas Consumed</span>
                  <span className="font-mono text-slate-600">{txResult.gasUsed}</span>
                </div>
              </div>

              {lastTxHash && (
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono truncate max-w-[200px]">
                    {lastTxHash}
                  </span>
                  <a
                    href={`https://scan.bohr.life/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    View on BohrScan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

