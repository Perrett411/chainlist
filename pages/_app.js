import * as React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { NextIntlProvider } from "next-intl";
import { useAnalytics } from "../hooks/useAnalytics";
import HypeLabProvider from "../components/HypeLabProvider";
import WalletProvider from "../contexts/WalletContext";
import GlobalWalletStatus from "../components/GlobalWalletStatus";
import AIWalletAssistant from "../components/AIWalletAssistant";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  useAnalytics();
  
  const [queryClient] = React.useState(() => new QueryClient());
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);
  const [aiAssistantMinimized, setAiAssistantMinimized] = React.useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <HypeLabProvider>
          {/* Global Wallet Status Bar */}
          <GlobalWalletStatus position="top" showDetails={true} />
          
          {/* <NextIntlProvider messages={pageProps.messages}> */}
          <Component {...pageProps} />
          {/* <SnackbarController /> */}
          {/* </NextIntlProvider> */}
          
          {/* AI Wallet Assistant */}
          <AIWalletAssistant 
            isMinimized={aiAssistantMinimized}
            onToggleSize={() => setAiAssistantMinimized(!aiAssistantMinimized)}
          />
        </HypeLabProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
