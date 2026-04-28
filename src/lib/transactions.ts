import * as StellarSdk from "@stellar/stellar-sdk";
import { horizon, networkPassphrase } from "./stellar";

export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizon.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return nativeBalance?.balance ?? "0";
  } catch (error) {
    if (error instanceof Error && error.message.includes("Account not found")) {
      return "0";
    }
    throw error;
  }
}

export async function buildPaymentTransaction(
  sourceAddress: string,
  destinationAddress: string,
  amount: string
): Promise<StellarSdk.Transaction> {
  if (sourceAddress === destinationAddress) {
    throw new Error("You cannot send funds to your own address");
  }

  const account = await horizon.loadAccount(sourceAddress);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
}

export async function submitTransaction(
  signedTransaction: StellarSdk.Transaction
): Promise<{ hash: string; ledger?: number }> {
  try {
    const response = await horizon.submitTransaction(signedTransaction);
    return {
      hash: response.hash,
      ledger: response.ledger,
    };
  } catch (error: any) {
    const resultCodes = error.response?.data?.extras?.result_codes;
    if (resultCodes) {
      if (resultCodes.transaction === "tx_bad_auth") {
        throw new Error("Transaction authentication failed. Please check your wallet network.");
      }
      if (resultCodes.operations?.includes("op_underfunded")) {
        throw new Error("Insufficient balance for this transaction.");
      }
      if (resultCodes.transaction === "tx_too_late") {
        throw new Error("Transaction timeout. Please try again.");
      }
      throw new Error(`Transaction failed: ${resultCodes.transaction || "Unknown error"}`);
    }
    throw error;
  }
}

export function getTransactionExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
