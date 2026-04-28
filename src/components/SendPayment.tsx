"use client";

import { useState, useCallback, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { isValidStellarAddress, formatXLM, shortenAddress } from "@/lib/stellar";
import { buildPaymentTransaction, submitTransaction, getAccountBalance, getTransactionExplorerUrl } from "@/lib/transactions";
import * as StellarSdk from "@stellar/stellar-sdk";

type TransactionStatus = "idle" | "loading" | "success" | "error";

interface TransactionResult {
  hash: string;
  explorerUrl: string;
  amount: string;
  destination: string;
  timestamp: Date;
}

interface SendPaymentProps {
  onBalanceRefresh?: () => void;
}

export function SendPayment({ onBalanceRefresh }: SendPaymentProps) {
  const { connected, address, sign } = useFreighter();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  // Track the values at time of send for the success card
  const [sentAmount, setSentAmount] = useState("");
  const [sentDestination, setSentDestination] = useState("");

  const resetState = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (address) {
      setLoadingBalance(true);
      try {
        const bal = await getAccountBalance(address);
        setBalance(bal);
      } catch {
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }
  }, [address]);

  useEffect(() => {
    if (connected && address) {
      fetchBalance();
    } else {
      setBalance(null);
      setDestination("");
      setAmount("");
      resetState();
    }
  }, [connected, address, fetchBalance, resetState]);

  const validateInputs = (): string | null => {
    if (!destination.trim()) return "Please enter a recipient address";
    if (destination.trim() === address) return "You cannot send funds to your own address";
    if (!isValidStellarAddress(destination.trim())) return "Invalid Stellar address";
    if (!amount.trim()) return "Please enter an amount";
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return "Amount must be greater than 0";
    if (loadingBalance) return "Fetching balance, please wait...";
    if (balance && amountNum > parseFloat(balance)) return "Insufficient balance";
    return null;
  };

  const handleSend = async () => {
    if (!connected || !address) return;

    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    // Capture values before clearing
    const capturedAmount = amount.trim();
    const capturedDest = destination.trim();

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const transaction = await buildPaymentTransaction(address, capturedDest, capturedAmount);
      const xdr = transaction.toXDR();

      let signedXdr: string;
      try {
        signedXdr = await sign(xdr);
      } catch (signError) {
        if (signError instanceof Error && signError.message.includes("User declined")) {
          setErrorMessage("Transaction rejected by user");
          setStatus("error");
          return;
        }
        throw signError;
      }

      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        transaction.networkPassphrase
      ) as StellarSdk.Transaction;

      const response = await submitTransaction(signedTransaction);

      setSentAmount(capturedAmount);
      setSentDestination(capturedDest);
      setResult({
        hash: response.hash,
        explorerUrl: getTransactionExplorerUrl(response.hash),
        amount: capturedAmount,
        destination: capturedDest,
        timestamp: new Date(),
      });
      setStatus("success");

      setDestination("");
      setAmount("");

      if (onBalanceRefresh) onBalanceRefresh();
      fetchBalance();
    } catch (err) {
      setStatus("error");
      let msg = err instanceof Error ? err.message : "Transaction failed";
      
      if (msg.includes("User declined") || msg.includes("XDR Read Error")) {
        msg = "Transaction cancelled";
      }
      
      setErrorMessage(msg);
      setResult(null);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  if (!connected) return null;

  const isSendDisabled = status === "loading" || !connected || !destination.trim() || !amount.trim();

  // ── SUCCESS STATE — replaces the form ──────────────────────────────────────
  if (status === "success" && result) {
    return (
      <div className="animate-in zoom-in-95 fade-in duration-500">
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-base">Payment Successful</p>
              <p className="text-zinc-400 text-xs">{result.timestamp.toLocaleString()}</p>
            </div>
          </div>

          {/* Amount highlight */}
          <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-2xl p-5 mb-5 text-center">
            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Amount Sent</p>
            <p className="text-4xl font-bold text-white tracking-tight">
              {formatXLM(sentAmount)}
              <span className="text-emerald-400 text-2xl ml-2">XLM</span>
            </p>
          </div>

          {/* Details grid */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Recipient</span>
              <span className="text-zinc-300 text-sm font-mono">{shortenAddress(sentDestination)}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Network</span>
              <span className="text-zinc-300 text-sm">Stellar Testnet</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Tx Hash</span>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-zinc-300 text-sm font-mono transition-colors hover:underline"
              >
                {result.hash.slice(0, 8)}...{result.hash.slice(-6)}
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-2xl text-center text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              View on Explorer
            </a>
            <button
              onClick={resetState}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98]"
            >
              Send Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h2 className="text-base font-medium text-white tracking-tight">Send Payment</h2>
        </div>

        <div className="space-y-4 relative z-10">
          {/* Recipient */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Recipient Address
            </label>
            <input
              type="text"
              autoFocus
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="GXXXXXXXX...XXXX"
              disabled={status === "loading"}
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 disabled:opacity-50 font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Amount (XLM)
            </label>
            <input
              type="number"
              step="0.0000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="0.0"
              disabled={status === "loading"}
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 disabled:opacity-50 font-mono text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[1, 5, 10, 50].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={status === "loading"}
                className="flex-1 px-2 py-2 text-xs font-medium text-zinc-400 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:bg-zinc-700/60 hover:text-white hover:border-zinc-600/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickAmount}
              </button>
            ))}
          </div>

          {/* Error */}
          {status === "error" && errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/40 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300 flex-1">{errorMessage}</p>
                <button onClick={resetState} className="text-red-500 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isSendDisabled}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-medium text-base hover:bg-zinc-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group/btn active:scale-[0.98] mt-1"
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send {amount ? `${formatXLM(amount)} XLM` : "XLM"}
                {!isSendDisabled && (
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
