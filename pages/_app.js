import * as React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { NextIntlProvider } from "next-intl";
import { useAnalytics } from "../hooks/useAnalytics";
import HypeLabProvider from "../components/HypeLabProvider";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  useAnalytics();

  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HypeLabProvider>
        {/* <NextIntlProvider messages={pageProps.messages}> */}
        <Component {...pageProps} />
        {/* <SnackbarController /> */}
        {/* </NextIntlProvider> */}
      </HypeLabProvider>
    </QueryClientProvider>
  );
}

export default App;
