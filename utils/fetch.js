import allExtraRpcs from "../constants/extraRpcs.js";
import chainIds from "../constants/chainIds.js";
import fetch from "node-fetch";
import { overwrittenChains } from "../constants/additionalChainRegistry/list.js";

export const fetcher = (...args) => fetch(...args).then((res) => res.json());

const cache = {}
export const fetchWithCache = async (url) => {
  if(cache[url]){
    return cache[url]
  }
  const data = await fetch(url).then((res) => res.json());
  cache[url] = data
  return data
}

function removeEndingSlashObject(rpc) {
  if (typeof rpc === "string") {
    return {
      url: removeEndingSlash(rpc),
    };
  } else {
    return {
      ...rpc,
      url: removeEndingSlash(rpc.url),
    };
  }
}

function removeEndingSlash(rpc) {
  return rpc.endsWith("/") ? rpc.substr(0, rpc.length - 1) : rpc;
}

export function populateChain(chain, chainTvls) {
  // Defensive guard to prevent crashes from undefined or malformed extraRpcs
  const safeExtraRpcs = allExtraRpcs && typeof allExtraRpcs === 'object' ? allExtraRpcs : {};
  const chainRpcs = safeExtraRpcs[chain.chainId]?.rpcs;
  let rpcs = Array.isArray(chainRpcs) ? chainRpcs.map(removeEndingSlashObject) : [];

  // Defensive guard for chain.rpc - ensure it's an array
  const chainRpcList = Array.isArray(chain.rpc) ? chain.rpc : [];
  
  for (const rpcUrl of chainRpcList) {
    const rpc = removeEndingSlashObject(rpcUrl);

    if (!rpc.url.includes("${INFURA_API_KEY}") && !rpcs.find((r) => r.url === rpc.url)) {
      rpcs = [...rpcs, rpc];
    }
  }

  chain.rpc = rpcs;

  const chainSlug = chainIds[chain.chainId];

  if (chainSlug !== undefined) {
    const defiChain = chainTvls.find((c) => c.name.toLowerCase() === chainSlug);

    return defiChain === undefined
      ? chain
      : {
          ...chain,
          tvl: defiChain.tvl,
          chainSlug,
        };
  }

  return chain;
}

export function mergeDeep(target, source) {
  const newTarget = { ...target };
  const isObject = (obj) => obj && typeof obj === "object";

  if (!isObject(newTarget) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = newTarget[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      newTarget[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      newTarget[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      newTarget[key] = sourceValue;
    }
  });

  return newTarget;
}

export function arrayMove(array, fromIndex, toIndex) {
  const newArray = [...array];
  const startIndex = fromIndex < 0 ? newArray.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < newArray.length) {
    const endIndex = toIndex < 0 ? newArray.length + toIndex : toIndex;
    const [item] = newArray.splice(fromIndex, 1);

    newArray.splice(endIndex, 0, item);
  }

  return newArray;
}

// Lightweight chain data for SSR - only basic fields without heavy extraRpcs
function createLightweightChain(chain) {
  return {
    chainId: chain.chainId,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    shortName: chain.shortName,
    tvl: chain.tvl,
    chainSlug: chain.chainSlug,
    // Only include first 2 RPC URLs for SSR, without tracking details
    rpc: Array.isArray(chain.rpc) ? chain.rpc.slice(0, 2).map(rpc => ({
      url: typeof rpc === 'string' ? rpc : rpc.url
    })) : []
  };
}

// Generate lightweight chain data for SSR (top 20 chains only)
export async function generateLightweightChainData() {
  const [chains, chainTvls] = await Promise.all([
    fetchWithCache("https://chainid.network/chains.json"),
    fetchWithCache("https://api.llama.fi/chains")
  ]);

  const overwrittenIds = overwrittenChains.reduce((acc, curr) => {
    acc[curr.chainId] = true;
    return acc;
  }, {});

  const sortedChains = chains
    .filter((c) => c.status !== "deprecated" && !overwrittenIds[c.chainId])
    .concat(overwrittenChains)
    .map((chain) => {
      const chainSlug = chainIds[chain.chainId];
      let populatedChain = { ...chain };
      
      if (chainSlug !== undefined) {
        const defiChain = chainTvls.find((c) => c.name.toLowerCase() === chainSlug);
        if (defiChain) {
          populatedChain.tvl = defiChain.tvl;
          populatedChain.chainSlug = chainSlug;
        }
      }
      
      return createLightweightChain(populatedChain);
    })
    .sort((a, b) => {
      return (b.tvl ?? 0) - (a.tvl ?? 0);
    })
    .slice(0, 20); // Only top 20 for SSR

  return sortedChains;
}

export async function generateChainData() {
  const [chains, chainTvls] = await Promise.all([
    fetchWithCache("https://chainid.network/chains.json"),
    fetchWithCache("https://api.llama.fi/chains")
  ]);

  const overwrittenIds = overwrittenChains.reduce((acc, curr) => {
    acc[curr.chainId] = true;
    return acc;
  }, {});

  const sortedChains = chains
    .filter((c) => c.status !== "deprecated" && !overwrittenIds[c.chainId])
    .concat(overwrittenChains)
    .map((chain) => populateChain(chain, chainTvls))
    .sort((a, b) => {
      return (b.tvl ?? 0) - (a.tvl ?? 0);
    });

  return sortedChains;
}
