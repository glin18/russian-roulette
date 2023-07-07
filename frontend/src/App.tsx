import "./App.css";
import Home from "./Home";

// RainbowKit
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, zora } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, zora],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_ID || "" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: "#FFC700",
            accentColorForeground: "black",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <Home />
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default App;
