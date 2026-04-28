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
      const operationsResponse = await horizon
        .operations()
        .forAccount(publicKey)
        .order("desc")
        .limit(20)
        .call();

      const paymentOps = operationsResponse.records
        .filter((op): op is Horizon.ServerApi.PaymentOperationRecord => op.type === "payment")
        .slice(0, 10)
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

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
      <div className="rounded-3xl glass-panel overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">Recent Payments</h2>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {!loading && address && (
              <button
                onClick={() => fetchTransactions(address)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-200"
                title="Refresh"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {transactions.length > 0 && (
              <span className="text-xs text-zinc-500 font-medium">{transactions.length} txns</span>
            )}
          </div>
        </div>

        {/* Column labels */}
        {transactions.length > 0 && (
          <div className="px-6 py-2 grid grid-cols-[auto_1fr_auto] gap-4 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium w-24">Type / Time</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Address</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right">Amount</span>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {error ? (
            <div className="px-6 py-10 text-center">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button
                onClick={() => address && fetchTransactions(address)}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                Try again
              </button>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => {
              const { date, time } = formatDate(tx.createdAt);
              const isSent = tx.type === "sent";
              const counterparty = isSent ? tx.destination : tx.source;
              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-white/[0.02] transition-colors duration-200 group"
                >
                  {/* Type + Time */}
                  <div className="w-24 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isSent ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {isSent ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${isSent ? "text-red-400" : "text-emerald-400"}`}>
                        {isSent ? "Sent" : "Received"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 pl-[26px]">{date} · {time}</span>
                  </div>

                  {/* Address + Hash */}
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-300 font-mono truncate">{shortenAddress(counterparty)}</p>
                    <a
                      href={getTransactionExplorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-zinc-500 hover:text-white font-mono transition-colors group-hover:text-zinc-400"
                    >
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)} ↗
                    </a>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-sm font-bold tabular-nums ${isSent ? "text-red-400" : "text-emerald-400"}`}>
                      {isSent ? "−" : "+"}{formatXLM(tx.amount)}
                    </p>
                    <p className="text-[10px] text-zinc-500">XLM</p>
                  </div>
                </div>
              );
            })
          ) : !loading ? (
            <div className="px-6 py-14 text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm">No payments yet</p>
              <p className="text-zinc-600 text-xs mt-1">Your transactions will appear here</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
