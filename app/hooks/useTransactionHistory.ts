"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: string;
  symbol: string;
  to?: string;
  from?: string;
  date: string;
  status: "pending" | "confirmed" | "failed" | "rejected";
  hash: string;
  chainId: number;
}

interface PendingTransaction {
  hash: `0x${string}`;
  chainId: number;
  to: string;
  amount: string;
  symbol: string;
  type: "send" | "receive";
  timestamp: number;
}

interface ChainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError?: string;
}

// Store pending transactions in localStorage (wallet-specific)
const getPendingStorageKey = (address: string) => `para_pending_transactions_${address.toLowerCase()}`;
const getConfirmedStorageKey = (address: string) => `para_confirmed_transactions_${address.toLowerCase()}`;

interface ConfirmedTransaction {
  hash: string;
  chainId: number;
  to: string;
  amount: string;
  symbol: string;
  type: "send" | "receive";
  timestamp: number;
  confirmedAt: number; // Timestamp when confirmed
}

function getPendingTransactions(walletAddress: string): PendingTransaction[] {
  if (typeof window === "undefined" || !walletAddress) return [];
  try {
    const storageKey = getPendingStorageKey(walletAddress);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePendingTransactions(walletAddress: string, txs: PendingTransaction[]) {
  if (typeof window === "undefined" || !walletAddress) return;
  try {
    localStorage.setItem(getPendingStorageKey(walletAddress), JSON.stringify(txs));
  } catch {
    // Ignore storage errors
  }
}

function getConfirmedTransactions(walletAddress: string): ConfirmedTransaction[] {
  if (typeof window === "undefined" || !walletAddress) return [];
  try {
    const storageKey = getConfirmedStorageKey(walletAddress);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveConfirmedTransactions(walletAddress: string, txs: ConfirmedTransaction[]) {
  if (typeof window === "undefined" || !walletAddress) return;
  try {
    localStorage.setItem(getConfirmedStorageKey(walletAddress), JSON.stringify(txs));
  } catch {
    // Ignore storage errors
  }
}

export function removePendingTransaction(walletAddress: string, hash: string) {
  const pending = getPendingTransactions(walletAddress);
  const filtered = pending.filter((tx) => tx.hash !== hash);
  savePendingTransactions(walletAddress, filtered);
}

export function addPendingTransaction(walletAddress: string, tx: PendingTransaction) {
  const pending = getPendingTransactions(walletAddress);
  // Check if already exists
  if (!pending.some((t) => t.hash === tx.hash)) {
    pending.push(tx);
    savePendingTransactions(walletAddress, pending);
  }
}

export function markTransactionConfirmed(walletAddress: string, hash: string) {
  // Find the transaction in pending list to get full data
  const pending = getPendingTransactions(walletAddress);
  const pendingTx = pending.find((t) => t.hash.toLowerCase() === hash.toLowerCase());
  
  if (pendingTx) {
    const confirmed = getConfirmedTransactions(walletAddress);
    if (!confirmed.some((t) => t.hash.toLowerCase() === hash.toLowerCase())) {
      confirmed.push({
        hash: pendingTx.hash,
        chainId: pendingTx.chainId,
        to: pendingTx.to,
        amount: pendingTx.amount,
        symbol: pendingTx.symbol,
        type: pendingTx.type,
        timestamp: pendingTx.timestamp,
        confirmedAt: Date.now(),
      });
      saveConfirmedTransactions(walletAddress, confirmed);
    }
    // Remove from pending after saving to confirmed
    removePendingTransaction(walletAddress, hash);
  }
}

function isTransactionConfirmed(walletAddress: string, hash: string): boolean {
  const confirmed = getConfirmedTransactions(walletAddress);
  return confirmed.some((t) => t.hash.toLowerCase() === hash.toLowerCase());
}

// Clean up old confirmed transactions (older than 1 hour) that should be in explorer by now
function cleanupOldConfirmedTransactions(walletAddress: string) {
  const confirmed = getConfirmedTransactions(walletAddress);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const filtered = confirmed.filter((t) => t.confirmedAt > oneHourAgo);
  if (filtered.length !== confirmed.length) {
    saveConfirmedTransactions(walletAddress, filtered);
  }
}

async function fetchTransactions(
  address: string,
  chainId: number
): Promise<ChainTransaction[]> {
  try {
    let apiUrl = "";

    switch (chainId) {
      case mainnet.id:
        apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=20`;
        break;
      case sepolia.id:
        apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=20`;
        break;
      case base.id:
        apiUrl = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=20`;
        break;
      case arbitrum.id:
        apiUrl = `https://api.arbiscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=20`;
        break;
      default:
        return [];
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "0" && data.message) {
      if (data.message.includes("rate limit") || data.message.includes("API")) {
        console.warn(`API limit reached for chain ${chainId}`);
        return [];
      }
    }

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result.filter(
        (tx: ChainTransaction) => !tx.isError || tx.isError === "0"
      );
    }

    return [];
  } catch (error) {
    console.error(`Error fetching transactions for chain ${chainId}:`, error);
    return [];
  }
}

export function useTransactionHistory() {
  const paraAccount = useParaAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const evmWallet = useMemo(() => {
    if (!paraAccount.isConnected || !paraAccount.embedded?.wallets) return null;
    const wallets = Object.values(paraAccount.embedded.wallets);
    return wallets.find((w: any) => w.type === "EVM");
  }, [paraAccount]);

  const walletAddress = evmWallet?.address as `0x${string}` | undefined;

  useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    // Clean up old confirmed transactions on mount
    cleanupOldConfirmedTransactions(walletAddress);

    let isInitialLoad = true;

    const fetchAllTransactions = async () => {
      // Only show loading state on initial load
      if (isInitialLoad) {
        setIsLoading(true);
        isInitialLoad = false;
      }
      
      // Re-fetch pending transactions fresh from storage
      const currentPendingTxs = getPendingTransactions(walletAddress);
      const currentPendingHashes = currentPendingTxs.map((tx) => tx.hash);
      
      const chains = [mainnet.id, base.id, arbitrum.id, sepolia.id];
      const allTxs: Transaction[] = [];
      const confirmedHashes = new Set<string>(); // Track which hashes are confirmed

      try {
        const results = await Promise.all(
          chains.map((chainId) => fetchTransactions(walletAddress, chainId))
        );

        results.forEach((chainTxs, index) => {
          const chainId = chains[index];
          const chainName = "ETH";

          chainTxs.forEach((tx) => {
            const txHash = tx.hash as `0x${string}`;
            
            // If this transaction is in pending list, mark it as confirmed
            if (currentPendingHashes.includes(txHash)) {
              confirmedHashes.add(txHash.toLowerCase());
              removePendingTransaction(walletAddress, tx.hash);
            }

            const isSend = tx.from.toLowerCase() === walletAddress.toLowerCase();
            const amount = parseFloat(tx.value) / 1e18;

            allTxs.push({
              id: `${chainId}-${tx.hash}`,
              type: isSend ? "send" : "receive",
              amount: amount.toFixed(6),
              symbol: chainName,
              to: isSend ? tx.to : undefined,
              from: isSend ? undefined : tx.from,
              date: tx.timeStamp,
              status: "confirmed", // Transactions from explorer are confirmed
              hash: tx.hash,
              chainId,
            });
          });
        });

        // Add pending transactions that are NOT confirmed
        currentPendingTxs.forEach((pending) => {
          const txHashLower = pending.hash.toLowerCase();
          const isConfirmedInExplorer = confirmedHashes.has(txHashLower);
          
          if (!isConfirmedInExplorer) {
            allTxs.push({
              id: `pending-${pending.hash}`,
              type: pending.type,
              amount: pending.amount,
              symbol: pending.symbol,
              to: pending.type === "send" ? pending.to : undefined,
              from: pending.type === "receive" ? pending.to : undefined,
              date: pending.timestamp.toString(),
              status: "pending",
              hash: pending.hash,
              chainId: pending.chainId,
            });
          }
        });
        
        // Add confirmed transactions that are NOT in explorer yet
        const confirmedTxs = getConfirmedTransactions(walletAddress);
        confirmedTxs.forEach((confirmed) => {
          // Skip if missing required fields (old format or corrupted data)
          if (!confirmed.hash || !confirmed.type) {
            return;
          }
          
          const txHashLower = confirmed.hash.toLowerCase();
          const isConfirmedInExplorer = confirmedHashes.has(txHashLower);
          
          if (!isConfirmedInExplorer) {
            const timestamp = confirmed.timestamp || confirmed.confirmedAt || Math.floor(Date.now() / 1000);
            allTxs.push({
              id: `confirmed-${confirmed.hash}`,
              type: confirmed.type,
              amount: confirmed.amount || "0",
              symbol: confirmed.symbol || "ETH",
              to: confirmed.type === "send" ? confirmed.to : undefined,
              from: confirmed.type === "receive" ? confirmed.to : undefined,
              date: timestamp.toString(),
              status: "confirmed",
              hash: confirmed.hash,
              chainId: confirmed.chainId || 1,
            });
          } else {
            // Already in explorer, remove from confirmed list as it's now indexed
            const filtered = confirmedTxs.filter((t) => t.hash.toLowerCase() !== txHashLower);
            saveConfirmedTransactions(walletAddress, filtered);
          }
        });

        // Sort by timestamp (newest first)
        allTxs.sort((a, b) => {
          const aTime = typeof a.date === "string" ? parseInt(a.date) : a.date;
          const bTime = typeof b.date === "string" ? parseInt(b.date) : b.date;
          return bTime - aTime;
        });

        // Limit to most recent 30 transactions
        const newTxs = allTxs.slice(0, 30);
        
        // Only update state if transactions actually changed
        setTransactions((prevTxs) => {
          // Serialize both for comparison (compare IDs and status)
          const prevStr = JSON.stringify(prevTxs.map((tx) => ({ id: tx.id, status: tx.status })).sort((a, b) => a.id.localeCompare(b.id)));
          const newStr = JSON.stringify(newTxs.map((tx) => ({ id: tx.id, status: tx.status })).sort((a, b) => a.id.localeCompare(b.id)));
          
          // If structure changed, update
          if (prevStr !== newStr) {
            return newTxs;
          }
          
          // Check if any transaction data changed (amount, date, etc.)
          const dataChanged = newTxs.some((newTx) => {
            const prevTx = prevTxs.find((p) => p.id === newTx.id);
            if (!prevTx) return true; // New transaction
            // Compare key fields
            return (
              prevTx.amount !== newTx.amount ||
              prevTx.hash !== newTx.hash ||
              prevTx.date !== newTx.date ||
              prevTx.status !== newTx.status
            );
          });
          
          return dataChanged ? newTxs : prevTxs;
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTransactions();
    
    // Refresh every 3 seconds to check for new transactions and pending status updates
    const interval = setInterval(fetchAllTransactions, 3000);
    
    // Also listen for custom events to immediately refresh when pending tx is added
    const handlePendingTxAdded = () => {
      fetchAllTransactions();
    };
    window.addEventListener("pendingTransactionAdded", handlePendingTxAdded);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("pendingTransactionAdded", handlePendingTxAdded);
    };
  }, [walletAddress]);

  return { transactions, isLoading };
}
