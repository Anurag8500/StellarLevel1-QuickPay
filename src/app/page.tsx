"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { BalanceSection } from "@/components/BalanceSection";
import { SendPayment } from "@/components/SendPayment";
import { Footer } from "@/components/Footer";
import { useFreighter } from "@/hooks/useFreighter";

export default function Home() {
  const { connected } = useFreighter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBalanceRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center gap-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Send XLM instantly
          </h2>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            A minimal, secure way to send micro-payments on the Stellar network
          </p>
        </div>

        {connected && (
          <div className="w-full space-y-8">
            <div key={refreshKey}>
              <BalanceSection />
            </div>
            <SendPayment onBalanceRefresh={handleBalanceRefresh} />
          </div>
        )}

        {!connected && (
          <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">
                Connect your wallet
              </h3>
              <p className="text-sm text-zinc-500">
                Connect your Freighter wallet to view balance and send payments
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
