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
        const text = await res.text();
        
        setFaucetStatus("error");
        return;
      }

      setFaucetStatus("success");
      await fetchBalance(address);
    } catch (err) {
      // Silent error handling for network failures
      setFaucetStatus("error");
    } finally {
      setFaucetLoading(false);
    }
  };

  if (!connected) return null;

  return (
    <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">XLM Balance</p>
              <p className="text-[10px] text-zinc-500">Stellar Testnet</p>
            </div>
          </div>
          {!loading && address && (
            <button
              onClick={() => fetchBalance(address)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-200"
              title="Refresh balance"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {/* Balance display */}
        <div className="relative z-10 mb-5">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-zinc-400 text-sm">Fetching balance...</span>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => address && fetchBalance(address)}
                className="mt-1.5 text-xs text-white/70 hover:text-white transition-colors"
              >
                Try again
              </button>
            </div>
          ) : balance ? (
            <div>
              <p className="text-3xl font-medium text-white tracking-tight">
                {formatXLM(balance)}{" "}
                <span className="text-lg text-zinc-500 font-normal">XLM</span>
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No balance found — fund your wallet below</p>
          )}
        </div>

        {/* Faucet */}
        <div className="relative z-10 pt-4 border-t border-white/5">
          <button
            onClick={handleFaucet}
            disabled={faucetLoading}
            className="w-full px-4 py-3 rounded-xl bg-white/5 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 active:scale-[0.98]"
            title="Friendbot sends a fixed amount of test XLM"
          >
            {faucetLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
                <span>Requesting funds...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Fund Wallet (Testnet)</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-zinc-500 mt-2 text-center uppercase tracking-widest">
            Via Stellar Friendbot
          </p>

          {faucetStatus === "success" && (
            <p className="text-emerald-400 text-xs mt-2 text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Test XLM received successfully
            </p>
          )}

          {faucetStatus === "error" && (
            <p className="text-red-400 text-xs mt-2 text-center animate-in fade-in duration-300">
              Funding failed — the account may already be funded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
