import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Chain from "../../components/chain";
import { generateLightweightChainData } from "../../utils/fetch";
import { useFilteredChains } from '../../hooks/useFilteredChains';
import { useChains } from '../../hooks/useChains';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

export async function getStaticProps() {
  // Only load lightweight chain data for SSR (top 20 chains)
  const lightweightChains = await generateLightweightChainData();

  return {
    props: {
      initialChains: lightweightChains,
      // messages: (await import(`../../translations/${locale}.json`)).default,
    },
    revalidate: 300, // Revalidate every 5 minutes
  };
}

function Home({ initialChains }) {
  // Use custom hook for chain data with client-side fetching
  const { chains, isLoading, hasFullData, error } = useChains(initialChains);
  const { chainName, setChainName, finalChains } = useFilteredChains(chains);
  const [end, setEnd] = React.useState(15);
  return (
    <>
      <Head>
        <title>X Chainlist - 新世代区块链网络</title>
        <meta
          name="description"
          content="X Chainlist - 先进的区块链网络、量子增强安全、AI驱动的金融管理和实时数据流。新世代区块链网络"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout lang="zh" chainName={chainName} setChainName={setChainName}>
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
                区块链网络和RPC端点
              </h2>
              <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-4">
                将您的钱包和Web3中间件连接到具有优化RPC端点的EVM网络
              </p>
            </div>
            {!hasFullData && !isLoading && (
              <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                显示前20个网络
              </div>
            )}
            {hasFullData && (
              <div className="text-xs text-green-600 dark:text-green-400">
                所有网络已加载
              </div>
            )}
          </div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[10px] p-4 mb-6">
            <div className="text-red-800 dark:text-red-200 text-sm">
              加载完整网络数据失败。显示缓存网络。
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center dark:text-[#B3B3B3] text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F80ED] mb-4"></div>
            <div>加载区块链网络中...</div>
          </div>
        ) : (
          <React.Suspense fallback={<div className="h-64 flex items-center justify-center dark:text-[#B3B3B3] text-gray-500">加载区块链网络中...</div>}>
            <div className="dark:text-[#B3B3B3] text-black grid gap-5 grid-cols-1 place-content-between pb-4 sm:pb-10 sm:grid-cols-[repeat(auto-fit,_calc(50%_-_15px))] 3xl:grid-cols-[repeat(auto-fit,_calc(33%_-_20px))] isolate grid-flow-dense">
              {finalChains.slice(0, end).map((chain) => {
                return <Chain chain={chain} key={JSON.stringify(chain) + "zh"} lang="zh" />;
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
            显示所有网络 ({finalChains.length - end + 1} 更多)
            {!hasFullData && (
              <span className="text-xs opacity-75">(加载完整数据中...)</span>
            )}
          </button>
        ) : null}
      </Layout>
    </>
  );
}

export default Home;
