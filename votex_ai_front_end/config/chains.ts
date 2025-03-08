import { type Chain } from "viem";

export const sonicTestnet = {
  id: 57054,
  name: "Sonic Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "S",
    symbol: "S",
  },
  rpcUrls: {
    default: { http: ["https://rpc.blaze.soniclabs.com"] },
    public: { http: ["https://rpc.blaze.soniclabs.com"] },
  },
  blockExplorers: {
    default: { name: "SonicScan", url: "https://testnet.sonicscan.app" },
  },
} as const satisfies Chain;
