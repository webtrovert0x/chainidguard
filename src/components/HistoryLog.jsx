import React, { useState } from 'react';
import { usePublicClient, useWriteContract } from 'wagmi';
import { CHAIN_ID_GUARD_ABI, DEFAULT_CONTRACT_ADDRESS } from '../contracts/ChainIDGuardABI';
import { Search, CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw, Database } from 'lucide-react';

export default function HistoryLog({ history = [], contractAddress = DEFAULT_CONTRACT_ADDRESS }) {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  // Query contract storage via getRequest(uint256)
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId || isNaN(lookupId) || Number(lookupId) <= 0) {
      setLookupError('Please enter a valid request ID greater than 0.');
      return;
    }

    if (!contractAddress || !contractAddress.startsWith('0x')) {
      setLookupError('Contract address is not set.');
      return;
    }

    try {
      setLookupLoading(true);
      setLookupError(null);
      setLookupResult(null);

      const data = await publicClient.readContract({
        address: contractAddress,
        abi: CHAIN_ID_GUARD_ABI,
        functionName: 'getRequest',
        args: [BigInt(lookupId)],
      });

      const [req, res] = data;

      setLookupResult({
        requestId: Number(req.id),
        requester: req.requester,
        expectedChainId: Number(req.expectedChainId),
        actualChainId: Number(res.actualChainId),
        isMatch: res.isMatch,
        timestamp: Number(req.timestamp),
        isResolved: req.isResolved,
      });
    } catch (err) {
      console.error('Failed to fetch request:', err);
      setLookupError(err.shortMessage || err.message || 'Request not found on-chain.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Publish/finalize result via publishResult(uint256 requestId)
  const handlePublishResult = async (id) => {
    if (!contractAddress || !id) return;
    try {
      setPublishingId(id);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: CHAIN_ID_GUARD_ABI,
        functionName: 'publishResult',
        args: [BigInt(id)],
        // strictly gas fee only: no value attached
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      alert(`Result for Request #${id} published on-chain!`);
      // Refresh lookup if looking up the same id
      if (Number(lookupId) === Number(id)) {
        handleLookup({ preventDefault: () => {} });
      }
    } catch (err) {
      alert(`Publish failed: ${err.shortMessage || err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Inspection History & On-Chain Storage Lookup</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query past inspection requests using <code className="text-blue-600">getRequest(requestId)</code> or inspect session audits.
          </p>
        </div>

        {/* Nonce Search Bar */}
        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative">
            <input
              type="number"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Query Request #"
              className="w-44 px-3 py-1.5 pl-8 rounded-lg border border-blue-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={lookupLoading}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            {lookupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Fetch</span>}
          </button>
        </form>
      </div>

      {/* Query result banner */}
      {lookupError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          ⚠️ {lookupError}
        </div>
      )}

      {lookupResult && (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                On-Chain Record: Request #{lookupResult.requestId}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                lookupResult.isMatch
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {lookupResult.isMatch ? 'VERIFIED MATCH' : 'MISMATCH'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-blue-100">
            <div>
              <span className="text-slate-400 text-[10px] block">Requester</span>
              <span className="font-mono text-slate-800 truncate block">
                {lookupResult.requester.slice(0, 6)}...{lookupResult.requester.slice(-4)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Expected Chain ID</span>
              <span className="font-mono font-bold text-slate-800">{lookupResult.expectedChainId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Actual (block.chainid)</span>
              <span className="font-mono font-bold text-blue-700">{lookupResult.actualChainId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Status</span>
              <span className="font-semibold text-slate-700">
                {lookupResult.isResolved ? 'Resolved' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handlePublishResult(lookupResult.requestId)}
              disabled={publishingId === lookupResult.requestId}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              {publishingId === lookupResult.requestId ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>Re-publish Result (publishResult)</span>
            </button>
          </div>
        </div>
      )}

      {/* Session History Table */}
      <div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
          Session Check Log
        </span>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            No inspection transactions submitted in this session yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Req #</th>
                  <th className="py-2.5 px-4">Expected</th>
                  <th className="py-2.5 px-4">Actual (block.chainid)</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Tx Hash</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      #{item.requestId || (index + 1)}
                    </td>
                    <td className="py-2.5 px-4 font-mono">{item.expectedChainId}</td>
                    <td className="py-2.5 px-4 font-mono text-blue-700 font-semibold">
                      {item.actualChainId}
                    </td>
                    <td className="py-2.5 px-4">
                      {item.isMatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" /> Mismatch
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 truncate max-w-[140px]">
                      {item.txHash ? (
                        <a
                          href={`https://scan.bohr.life/tx/${item.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {item.txHash.slice(0, 8)}... <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        '---'
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.requestId && (
                        <button
                          onClick={() => handlePublishResult(item.requestId)}
                          disabled={publishingId === item.requestId}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

