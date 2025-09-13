import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Chain from "../components/chain";
import { AdBanner } from "../components/AdBanner";
import ConversationalAI from "../components/ConversationalAI";
import QuantumLockChain from "../components/QuantumLockChain";
import DataStreaming from "../components/DataStreaming";
import CryptoWalletConnections from "../components/CryptoWalletConnections";
import CryptoDataFeed from "../components/CryptoDataFeed";
import CoinMarketCapFeed from "../components/CoinMarketCapFeed";
import BankConnections from "../components/BankConnections";
import AuthSystem from "../components/AuthSystem";
import AdminPanel from "../components/AdminPanel";
import PortfolioManagement from "../components/PortfolioManagement";
import AssetTransfer from "../components/AssetTransfer";
import AgentPortal from "../components/AgentPortal";
import { generateLightweightChainData } from "../utils/fetch";
import { useFilteredChains } from '../hooks/useFilteredChains';
import { useChains } from '../hooks/useChains';
import { PERRETT_CONFIG } from '../constants/perrettAssociates';

export async function getStaticProps() {
  // Only load lightweight chain data for SSR (top 20 chains)
  const lightweightChains = await generateLightweightChainData();

  return {
    props: {
      initialChains: lightweightChains,
      // messages: (await import(`../translations/${locale}.json`)).default,
    },
    revalidate: 300, // Revalidate every 5 minutes
  };
}

function Home({ initialChains }) {
  // Use custom hook for chain data with client-side fetching
  const { chains, isLoading, hasFullData, error } = useChains(initialChains);
  const { chainName, setChainName, finalChains } = useFilteredChains(chains);
  const [user, setUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('blockchain');
  const [end, setEnd] = React.useState(15);

  const tabs = [
    { id: 'blockchain', name: 'Blockchain Networks', icon: '🔗' },
    { id: 'quantum', name: 'Quantum Lock Chain', icon: '⚛️' },
    { id: 'ai', name: 'CFO AI Assistant', icon: '🤖' },
    { id: 'agent', name: 'Agent Portal', icon: '👨‍💼' },
    { id: 'portfolio', name: 'Portfolio Management', icon: '📊' },
    { id: 'transfer', name: 'Asset Transfer', icon: '💸' },
    { id: 'crypto', name: 'Crypto Wallets', icon: '💰' },
    { id: 'banks', name: 'Bank Connections', icon: '🏦' },
    { id: 'delta', name: 'Delta Data Feed', icon: '📈' },
    { id: 'cmc', name: 'CoinMarketCap', icon: '🟠' },
    { id: 'streaming', name: 'Data Streaming', icon: '📊' },
    { id: 'admin', name: 'API Controls', icon: '⚙️' }
  ];

  return (
    <>
      <Head>
        <title>X Chainlist - Next-Generation Blockchain Networks</title>
        <meta
          name="description"
          content="X Chainlist - Advanced blockchain networks, quantum-enhanced security, AI-powered financial management, and real-time data streaming. Next-Generation Blockchain Networks"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout chainName={chainName} setChainName={setChainName}>
        <div className="space-y-6">
          {/* Authentication Section */}
          {!user && (
            <div className="mb-8">
              <AuthSystem onAuthChange={setUser} />
            </div>
          )}

          {/* User Dashboard */}
          {user && (
            <>
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#171717] dark:to-[#171717] rounded-[10px] p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold dark:text-[#B3B3B3] text-black mb-2">
                      Welcome to {PERRETT_CONFIG.OWNER}
                    </h1>
                    <p className="dark:text-[#B3B3B3] text-gray-600">
                      {PERRETT_CONFIG.BRAND.tagline} • Logged in as {user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
                      {user.role.toUpperCase()} ACCESS
                    </div>
                    <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                      Quantum-secured session
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[50px] whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#2F80ED] text-white'
                        : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 hover:bg-gray-200 dark:hover:bg-[#252525]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'ai' && user && <ConversationalAI />}
                {activeTab === 'quantum' && user && <QuantumLockChain />}
                {activeTab === 'agent' && user && <AgentPortal user={user} />}
                {activeTab === 'portfolio' && user && <PortfolioManagement />}
                {activeTab === 'transfer' && user && <AssetTransfer />}
                {activeTab === 'crypto' && user && <CryptoWalletConnections />}
                {activeTab === 'banks' && user && <BankConnections />}
                {activeTab === 'delta' && user && <CryptoDataFeed />}
                {activeTab === 'cmc' && user && <CoinMarketCapFeed />}
                {activeTab === 'streaming' && user && <DataStreaming />}
                {activeTab === 'admin' && user && <AdminPanel user={user} />}
                
                {activeTab === 'blockchain' && (
                  <div>
                    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
                            Blockchain Networks & RPC Endpoints
                          </h2>
                          <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-4">
                            Connect your wallets and Web3 middleware to EVM networks with optimized RPC endpoints
                          </p>
                        </div>
                        {!hasFullData && !isLoading && (
                          <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                            Showing top 20 networks
                          </div>
                        )}
                        {hasFullData && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            All networks loaded
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Error State */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[10px] p-4 mb-6">
                        <div className="text-red-800 dark:text-red-200 text-sm">
                          Failed to load full network data. Showing cached networks.
                        </div>
                      </div>
                    )}
                    
                    {/* Loading State */}
                    {isLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center dark:text-[#B3B3B3] text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F80ED] mb-4"></div>
                        <div>Loading blockchain networks...</div>
                      </div>
                    ) : (
                      <React.Suspense fallback={<div className="h-64 flex items-center justify-center dark:text-[#B3B3B3] text-gray-500">Loading blockchain networks...</div>}>
                        <div className="dark:text-[#B3B3B3] text-black grid gap-5 grid-cols-1 place-content-between pb-4 sm:pb-10 sm:grid-cols-[repeat(auto-fit,_calc(50%_-_15px))] 3xl:grid-cols-[repeat(auto-fit,_calc(33%_-_20px))] isolate grid-flow-dense">
                          {finalChains.slice(0, 2).map((chain) => {
                            return <Chain chain={chain} key={JSON.stringify(chain) + "en"} lang="en" />;
                          })}
                          <AdBanner />
                          {finalChains.slice(2, end).map((chain) => {
                            return <Chain chain={chain} key={JSON.stringify(chain) + "en"} lang="en" />;
                          })}
                        </div>
                      </React.Suspense>
                    )}
                    
                    {/* Show More Button */}
                    {!isLoading && end - 1 < finalChains.length ? (
                      <button
                        onClick={() => setEnd(finalChains.length)}
                        className="w-full border dark:border-[#171717] border-[#EAEAEA] px-4 py-2 rounded-[50px] mb-auto text-white bg-[#2F80ED] mx-auto flex items-center justify-center gap-2"
                      >
                        Show all networks ({finalChains.length - end + 1} more)
                        {!hasFullData && (
                          <span className="text-xs opacity-75">(Loading full data...)</span>
                        )}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Connection Status to External System */}
          {user && (
            <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm dark:text-[#B3B3B3] text-gray-700">
                    External System Status: www.perrettandassociates.com
                  </span>
                </div>
                <span className="text-xs dark:text-[#B3B3B3] text-gray-500">
                  Monitoring connection • Failover system active
                </span>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export default Home;
