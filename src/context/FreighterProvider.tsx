"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";
import { networkPassphrase } from "@/lib/stellar";

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string | null;
  isInstalling: boolean;
}

interface FreighterContextType extends WalletState {
  connect: () => Promise<string | undefined>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
  refresh: () => Promise<void>;
}

const FreighterContext = createContext<FreighterContextType | undefined>(undefined);

export function FreighterProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    network: null,
    isInstalling: false,
  });

  const checkConnection = useCallback(async () => {
    try {
      const freighterConnected = await isConnected();
      if (!freighterConnected) {
        setWalletState((prev) => ({ ...prev, isInstalling: true }));
        return;
      }

      // Check if user has explicitly connected before (Session control)
      const shouldConnect = localStorage.getItem("wallet_connected");
      if (!shouldConnect) {
        setWalletState({
          connected: false,
          address: null,
          network: null,
          isInstalling: false,
        });
        return;
      }

      // If session exists, verify permissions and get address
      const allowed = await isAllowed();
      if (allowed) {
        const { address: pubKey } = await getAddress();
        const { network: net } = await getNetwork();
        
        setWalletState((prev) => {
          // Only update state if address or network actually changed
          if (prev.address !== pubKey || prev.network !== net || !prev.connected) {
            return {
              connected: true,
              address: pubKey,
              network: net,
              isInstalling: false,
            };
          }
          return prev;
        });
      } else {
        // Session exists but permissions revoked
        localStorage.removeItem("wallet_connected");
        setWalletState({
          connected: false,
          address: null,
          network: null,
          isInstalling: false,
        });
      }
    } catch {
      setWalletState({
        connected: false,
        address: null,
        network: null,
        isInstalling: false,
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const handleFocus = () => checkConnection();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkConnection]);

  const connect = useCallback(async () => {
    try {
      const freighterConnected = await isConnected();
      if (!freighterConnected) {
        setWalletState((prev) => ({ ...prev, isInstalling: true }));
        window.open("https://freighter.app", "_blank");
        throw new Error("Freighter extension not installed");
      }

      // ALWAYS call setAllowed to trigger the Freighter popup for account selection/confirmation
      await setAllowed();
      const { address: pubKey } = await getAddress();
      const { network: net } = await getNetwork();

      localStorage.setItem("wallet_connected", "true");
      setWalletState({
        connected: true,
        address: pubKey,
        network: net,
        isInstalling: false,
      });

      return pubKey;
    } catch (error) {
      // If user cancels or there's an error, we don't necessarily want to reset isInstalling 
      // if it was already false, but we should handle the error.
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("wallet_connected");
    setWalletState({
      connected: false,
      address: null,
      network: null,
      isInstalling: false,
    });
  }, []);

  const sign = useCallback(
    async (xdr: string): Promise<string> => {
      if (!walletState.connected) {
        throw new Error("Wallet not connected");
      }
      const result = await signTransaction(xdr, { networkPassphrase });
      return result.signedTxXdr;
    },
    [walletState.connected]
  );

  return (
    <FreighterContext.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        sign,
        refresh: checkConnection,
      }}
    >
      {children}
    </FreighterContext.Provider>
  );
}

export function useFreighterContext() {
  const context = useContext(FreighterContext);
  if (context === undefined) {
    throw new Error("useFreighterContext must be used within a FreighterProvider");
  }
  return context;
}
