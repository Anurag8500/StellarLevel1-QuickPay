"use client";

import { useState, useCallback, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { isValidStellarAddress, formatXLM } from "@/lib/stellar";
import { buildPaymentTransaction, submitTransaction, getAccountBalance, getTransactionExplorerUrl } from "@/lib/transactions";
import * as StellarSdk from "@stellar/stellar-sdk";

type TransactionStatus = "idle" | "loading" | "success" | "error";

interface TransactionResult {
  hash: string;
  explorerUrl: string;
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
  }, [connected, address, fetchBalance]);

  const validateInputs = (): string | null => {
    if (!destination.trim()) {
      return "Please enter a recipient address";
    }
    if (!isValidStellarAddress(destination.trim())) {
      return "Invalid Stellar address";
    }
    if (!amount.trim()) {
      return "Please enter an amount";
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return "Amount must be greater than 0";
    }
    if (loadingBalance) {
      return "Fetching balance, please wait...";
    }
    if (balance && amountNum > parseFloat(balance)) {
      return "Insufficient balance";
    }
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

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      setStatus("loading");
      setErrorMessage(null);

      const transaction = await buildPaymentTransaction(
        address,
        destination.trim(),
        amount.trim()
      );

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

      setResult({
        hash: response.hash,
        explorerUrl: getTransactionExplorerUrl(response.hash),
      });
      setStatus("success");

      setDestination("");
      setAmount("");

      if (onBalanceRefresh) {
        onBalanceRefresh();
      }
      fetchBalance();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Transaction failed");
      setResult(null);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const resetState = () => {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Send Payment</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="GXXXXXXXX...XXXX"
              disabled={status === "loading"}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Amount (XLM)
            </label>
            <input
              type="number"
              step="0.0000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={status === "loading"}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 font-mono text-lg"
            />
          </div>

          <div className="flex gap-2">
            {[1, 5, 10].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={status === "loading"}
                className="flex-1 px-3 py-2 text-sm font-medium text-zinc-400 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickAmount}
              </button>
            ))}
          </div>

          {status === "error" && errorMessage && (
            <div className="p-4 rounded-xl bg-red-950 border border-red-900">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
                <button
                  onClick={resetState}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {status === "success" && result && (
            <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-900">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-emerald-300 font-medium mb-1">
                    Transaction Submitted!
                  </p>
                  <a
                    href={result.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-mono break-all hover:underline"
                  >
                    {result.hash}
                  </a>
                </div>
                <button
                  onClick={resetState}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={status === "loading" || !connected}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" style={{ animationDelay: "0.15s" }} />
                </div>
                <span>Sending...</span>
              </div>
            ) : (
              <span className="relative z-10">Send {amount ? `${formatXLM(amount)}` : ""} XLM</span>
            )}
            {status !== "loading" && (
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
