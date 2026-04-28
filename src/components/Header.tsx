"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";

export function Header() {
  const { connected, address, isInstalling, connect, disconnect } = useFreighter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setShowConfirm(false);
  };

  return (
    <header className="w-full px-6 py-5 flex items-center justify-between relative">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
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
        <h1 className="text-xl font-semibold text-white tracking-tight">
          QuickPay
        </h1>
      </div>

      <div>
        {connected && address ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
              <span className="text-xs sm:text-sm text-zinc-300 font-mono">
                {shortenAddress(address)}
              </span>
            </div>
            <button
              onClick={() => setShowSwitchModal(true)}
              className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors duration-200"
            >
              Switch
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isInstalling}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstalling ? "Install Freighter" : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-white mb-2">
              Disconnect Wallet?
            </h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to disconnect? You will need to reconnect to send payments.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600/10 text-red-500 font-medium hover:bg-red-600/20 transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Wallet Instructions Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Switch Wallet
            </h3>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              To switch accounts, open your <span className="text-violet-400 font-medium">Freighter wallet</span> extension and select a different account.
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
              className="w-full px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
