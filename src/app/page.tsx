"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { BalanceSection } from "@/components/BalanceSection";
import { SendPayment } from "@/components/SendPayment";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Footer } from "@/components/Footer";
import { useFreighter } from "@/hooks/useFreighter";

export default function Home() {
  const { connected, network, connect } = useFreighter();
  const [refreshKey, setRefreshKey] = useState(0);

  const isTestnet = network === "TESTNET";

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] relative selection:bg-white/20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-zinc-800/20 mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-900/40 mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[25%] w-[35%] h-[35%] rounded-full bg-neutral-800/20 mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">

          {/* Hero Text */}
          <div className="text-center space-y-3 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Send XLM instantly
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-lg mx-auto">
              A minimal, secure way to send micro-payments on the Stellar network
            </p>
          </div>

          {connected && !isTestnet && (
            <div className="w-full max-w-lg mx-auto p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-orange-200">
                Please switch your <span className="font-semibold">Freighter wallet</span> to Stellar Testnet
              </p>
            </div>
          )}

          {connected && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left column: Balance + Send Payment stacked */}
              <div className="flex flex-col gap-6">
                <div key={refreshKey}>
                  <BalanceSection />
                </div>
                <SendPayment onBalanceRefresh={handleRefresh} />
              </div>

              {/* Right column: Transaction History */}
              <div>
                <TransactionHistory refreshTrigger={refreshKey} />
              </div>
            </div>
          )}

          {!connected && (
            <div className="w-full max-w-sm mx-auto p-8 rounded-3xl glass-panel text-center space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <svg
                  className="w-8 h-8 text-white"
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
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-white">Connect your wallet</h3>
                <p className="text-sm text-zinc-400">
                  Connect your Freighter wallet to view balance and send payments
                </p>
              </div>
              <button
                onClick={connect}
                className="w-full py-3.5 rounded-2xl bg-white text-black font-medium text-base hover:bg-zinc-200 transition-all duration-300 active:scale-[0.98] group"
              >
                <span className="flex items-center justify-center gap-2">
                  Connect Wallet
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
