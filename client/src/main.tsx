import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import { http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
   binanceWallet, braveWallet, coinbaseWallet, injectedWallet, ledgerWallet, metaMaskWallet, nestWallet, rainbowWallet, trustWallet, uniswapWallet, walletConnectWallet
} from '@rainbow-me/rainbowkit/wallets';


const queryClient = new QueryClient();

const projectId = "222dabd62d413e59e72265d2a718e740";

const localhost = {
  id: 31337,
  name: 'Hardhat',
  network: 'localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { 
      http: [`http://localhost:8545`]
    },
    public: {
      http: [`http://localhost:8545`]
    }
  }
};

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet, metaMaskWallet,  injectedWallet,braveWallet],
    },
    {
      groupName:'Other Wallets',
      wallets:[coinbaseWallet, trustWallet, uniswapWallet, binanceWallet, nestWallet, ledgerWallet,]
    }
  ],
  {
    appName: 'new project',
    projectId: '222dabd62d413e59e72265d2a718e740',
  }
);

const client = new ApolloClient({
  uri: 'https://pharma-server-zeta.vercel.app/graphql',
  cache: new InMemoryCache(),
});

// @ts-ignore
const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId,
  chains: [localhost, mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
  // @ts-ignore
  walletConnectVersion: "2",
  transports: {
    [localhost.id]: http(`http://localhost:8545`),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
  },
  // @ts-ignore
  connectors
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
 
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider >
            <ApolloProvider client={client}>
            <App />
            </ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
 
</StrictMode>,
)
