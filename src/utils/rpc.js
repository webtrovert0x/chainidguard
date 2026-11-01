/**
 * Probes an RPC endpoint by querying `eth_chainId` and measures round-trip latency.
 * @param {string} rpcUrl
 * @returns {Promise<{ chainId: number | null, hexChainId: string | null, latencyMs: number, error: string | null }>}
 */
export async function probeRpcEndpoint(rpcUrl) {
  if (!rpcUrl || typeof rpcUrl !== 'string' || !rpcUrl.trim()) {
    return { chainId: null, hexChainId: null, latencyMs: 0, error: 'Empty RPC URL' };
  }

  const cleanUrl = rpcUrl.trim();
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      return {
        chainId: null,
        hexChainId: null,
        latencyMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        chainId: null,
        hexChainId: null,
        latencyMs,
        error: data.error.message || 'RPC returned error',
      };
    }

    const hexChainId = data.result;
    if (!hexChainId || typeof hexChainId !== 'string') {
      return {
        chainId: null,
        hexChainId: null,
        latencyMs,
        error: 'Invalid response format from RPC',
      };
    }

    const chainId = parseInt(hexChainId, 16);

    return {
      chainId,
      hexChainId,
      latencyMs,
      error: null,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    let errorMessage = err.message || 'Failed to connect to RPC';
    if (err.name === 'AbortError') {
      errorMessage = 'Connection timed out (>8s)';
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorMessage = 'Network connection failed or CORS blocked by RPC';
    }
    return {
      chainId: null,
      hexChainId: null,
      latencyMs,
      error: errorMessage,
    };
  }
}

