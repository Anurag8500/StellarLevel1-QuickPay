import * as StellarSdk from "@stellar/stellar-sdk";

export const config = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    friendbotUrl: "https://friendbot.stellar.org",
  },
  public: {
    horizonUrl: "https://horizon.stellar.org",
    rpcUrl: "",
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    friendbotUrl: null,
  },
} as const;

export type Network = keyof typeof config;

const NETWORK: Network = "testnet";

export const stellarConfig = config[NETWORK];
export const horizon = new StellarSdk.Horizon.Server(stellarConfig.horizonUrl);
export const rpc = new StellarSdk.rpc.Server(stellarConfig.rpcUrl);
export const networkPassphrase = stellarConfig.networkPassphrase;

export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatXLM(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}
