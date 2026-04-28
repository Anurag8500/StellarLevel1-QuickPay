"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { formatXLM } from "@/lib/stellar";
import { getAccountBalance } from "@/lib/transactions";

export function BalanceSection() {
  const { connected, address } = useFreighter();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetStatus, setFaucetStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    setBalance(null);
    setError(null);
    setFaucetStatus(null);

    if (connected && address) {
      setLoading(true); 
      fetchBalance(address);
    }
  }, [connected, address]);

  const fetchBalance = async (publicKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const balanceAmount = await getAccountBalance(publicKey);
      setBalance(balanceAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFaucet = async () => {
    if (!address) return;

    setFaucetLoading(true);
    setFaucetStatus(null);

    try {
      const res = await fetch(`https://friendbot.stellar.org/?addr=${address}`);

      if (!res.ok) {
        throw new Error("Friendbot request failed");
      }

      setFaucetStatus("success");
      
      await fetchBalance(address);
    } catch (err) {
      console.error("Faucet error:", err);
      setFaucetStatus("error");
    } finally {
      setFaucetLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">XLM Balance</p>
            <p className="text-xs text-zinc-600">Stellar Testnet</p>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-500 text-sm">Fetching balance...</span>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => address && fetchBalance(address)}
                className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : balance ? (
            <p className="text-3xl font-semibold text-white tracking-tight">
              {formatXLM(balance)}{" "}
              <span className="text-lg text-zinc-500">XLM</span>
            </p>
          ) : (
            <p className="text-zinc-600 text-sm">No balance found</p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800/50">
          <button
            onClick={handleFaucet}
            disabled={faucetLoading}
            className="w-full px-4 py-3 rounded-xl bg-violet-600/10 text-violet-400 font-medium hover:bg-violet-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-violet-600/20"
            title="Friendbot sends a fixed amount of test XLM"
          >
            {faucetLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <span>Requesting funds...</span>
              </>
            ) : (
              <>
                <span className="text-lg">💧</span>
                <span>Get Test XLM</span>
              </>
            )}
          </button>
          
          {faucetStatus === "success" && (
            <p className="text-green-400 text-xs mt-3 text-center flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Test XLM received!
            </p>
          )}
          
          {faucetStatus === "error" && (
            <p className="text-red-400 text-xs mt-3 text-center animate-in fade-in slide-in-from-top-1 duration-300">
              Failed to fund wallet. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
