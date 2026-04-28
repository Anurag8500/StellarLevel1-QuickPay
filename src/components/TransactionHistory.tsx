"use client";

import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { horizon, shortenAddress, formatXLM } from "@/lib/stellar";
import { getTransactionExplorerUrl } from "@/lib/transactions";
import { Horizon } from "@stellar/stellar-sdk";

interface PaymentTransaction {
  id: string;
  hash: string;
  amount: string;
  destination: string;
  source: string;
  createdAt: string;
  type: "sent" | "received";
}

export function TransactionHistory({ refreshTrigger }: { refreshTrigger?: number }) {
  const { connected, address } = useFreighter();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (publicKey: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the last 20 operations to find at least some payments
      const operationsResponse = await horizon
        .operations()
        .forAccount(publicKey)
        .order("desc")
        .limit(20)
        .call();

      const paymentOps = operationsResponse.records
        .filter((op): op is Horizon.ServerApi.PaymentOperationRecord => op.type === "payment")
        .slice(0, 10) // Only take the last 10 payments
        .map((op) => {
          const isSent = op.from === publicKey;
          return {
            id: op.id,
            hash: op.transaction_hash,
            amount: op.amount,
            destination: op.to,
            source: op.from,
            createdAt: op.created_at,
            type: isSent ? "sent" : "received",
          } as PaymentTransaction;
        });

      setTransactions(paymentOps);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected && address) {
      fetchTransactions(address);
    } else {
      setTransactions([]);
    }
  }, [connected, address, fetchTransactions, refreshTrigger]);

  if (!connected) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
          </div>
          {loading && (
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="space-y-4">
          {error ? (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button 
                onClick={() => address && fetchTransactions(address)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === "sent" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                  }`}>
                    {tx.type === "sent" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wider ${
                        tx.type === "sent" ? "text-red-400" : "text-green-400"
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-zinc-500 text-[10px]">•</span>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 font-mono">
                      {shortenAddress(tx.type === "sent" ? tx.destination : tx.source)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {tx.type === "sent" ? "-" : "+"}{formatXLM(tx.amount)} XLM
                  </p>
                  <a 
                    href={getTransactionExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
            ))
          ) : !loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No recent payments</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
