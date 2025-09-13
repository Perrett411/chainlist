import { generateChainData } from "../../utils/fetch";

// In-memory cache
const cache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Helper to check if cache is still valid
function isCacheValid() {
  return cache.data && cache.timestamp && (Date.now() - cache.timestamp) < cache.CACHE_DURATION;
}

// Remove heavy extraRpcs data that shouldn't be sent to client
function stripServerOnlyData(chains) {
  return chains.map(chain => {
    // Explicitly whitelist only client-safe fields - NEVER use spread operator
    const clientSafeChain = {
      chainId: chain.chainId,
      name: chain.name,
      shortName: chain.shortName,
      nativeCurrency: chain.nativeCurrency,
      tvl: chain.tvl,
      chainSlug: chain.chainSlug,
      // Handle additional safe fields that may be present
      ...(chain.networkId && { networkId: chain.networkId }),
      ...(chain.slip44 && { slip44: chain.slip44 }),
      ...(chain.ens && { ens: chain.ens }),
      ...(chain.explorers && { explorers: chain.explorers }),
      ...(chain.faucets && { faucets: chain.faucets }),
      ...(chain.infoURL && { infoURL: chain.infoURL }),
      ...(chain.parent && { parent: chain.parent }),
      ...(chain.status && { status: chain.status }),
      
      // Keep only essential RPC data, strip server-only extraRpcs and tracking data
      rpc: chain.rpc ? chain.rpc.slice(0, 3).map(rpc => ({
        // Handle both string and object RPC types
        url: typeof rpc === 'string' ? rpc : rpc.url,
        // Remove all tracking details and other sensitive data
      })) : [],
    };

    // Security verification - explicitly ensure extraRpcs is not present
    if (chain.extraRpcs || chain.serverOnlyData) {
      console.warn(`[SECURITY] Stripped extraRpcs/serverOnlyData from chain ${chain.chainId}`);
    }

    // Additional security check - verify no extraRpcs in final output
    if (clientSafeChain.extraRpcs) {
      console.error(`[SECURITY BREACH] extraRpcs found in client response for chain ${chain.chainId}`);
      delete clientSafeChain.extraRpcs;
    }

    return clientSafeChain;
  });
}

export default async function handler(req, res) {
  try {
    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // 5min cache, 10min stale
    res.setHeader('Content-Type', 'application/json');

    // Check if we have valid cached data
    if (isCacheValid()) {
      return res.status(200).json({
        success: true,
        data: cache.data,
        cached: true,
        timestamp: cache.timestamp
      });
    }

    // Fetch fresh data
    console.log('Fetching fresh chain data...');
    const sortedChains = await generateChainData();
    
    // Strip server-only data before sending to client
    const clientSafeChains = stripServerOnlyData(sortedChains);

    // Update cache
    cache.data = clientSafeChains;
    cache.timestamp = Date.now();

    res.status(200).json({
      success: true,
      data: clientSafeChains,
      cached: false,
      timestamp: cache.timestamp
    });

  } catch (error) {
    console.error('Error in /api/chains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chain data',
      message: error.message
    });
  }
}