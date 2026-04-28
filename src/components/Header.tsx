"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";

export function Header() {
  const { connected, address, isInstalling, connect, disconnect } = useFreighter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setShowConfirm(false);
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50 glass-panel border-x-0 border-t-0 border-b-white/[0.06] animate-in slide-in-from-top-4 fade-in duration-700">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 className="text-base font-medium text-white tracking-tight">
          QuickPay
        </h1>
      </div>

      <div>
        {connected && address ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10">
                Testnet
              </span>
              <button
                onClick={handleCopy}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
                title="Copy address"
              >
                <span className="text-xs sm:text-sm text-zinc-300 font-mono">
                  {shortenAddress(address)}
                </span>
                <span className="text-zinc-500 group-hover:text-white transition-colors">
                  {copied ? (
                    <span className="text-[10px] font-medium text-white">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowSwitchModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              Switch
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isInstalling}
            className="px-5 py-2 text-sm font-medium text-black bg-white rounded-xl hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isInstalling ? "Install Freighter" : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-semibold text-white mb-2">
              Disconnect Wallet?
            </h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to disconnect? You will need to reconnect to send payments.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800/80 text-white font-medium hover:bg-zinc-700/80 transition-colors border border-zinc-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600/10 text-red-400 font-medium hover:bg-red-600/20 transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Wallet Instructions Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Switch Wallet
            </h3>
            <p className="text-zinc-400 mb-6 leading-relaxed text-sm">
              To switch accounts, open your <span className="text-white font-medium">Freighter wallet</span> extension and select a different account.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 mt-0.5 shrink-0">1</div>
                <p className="text-sm text-zinc-500">Open Freighter extension</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 mt-0.5 shrink-0">2</div>
                <p className="text-sm text-zinc-500">Change your active account</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 mt-0.5 shrink-0">3</div>
                <p className="text-sm text-zinc-500">Return here to see the update</p>
              </div>
            </div>

            <button
              onClick={() => setShowSwitchModal(false)}
              className="w-full px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
