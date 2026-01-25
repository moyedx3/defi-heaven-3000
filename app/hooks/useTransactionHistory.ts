"use client";

import { useState, useEffect } from "react";
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";
import { useEvmWallet } from "./useEvmWallet";

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

interface ConfirmedTransaction {
  hash: string;
  chainId: number;
  to: string;
  amount: string;
  symbol: string;
  type: "send" | "receive";
  timestamp: number;
  confirmedAt: number;
}

// Polling interval - reduced from 3s to 15s to avoid API rate limits
const POLL_INTERVAL = 15000;
const CHAINS = [mainnet.id, base.id, arbitrum.id, sepolia.id];

// Storage key helpers
const getPendingStorageKey = (address: string) => `para_pending_transactions_${address.toLowerCase()}`;
const getConfirmedStorageKey = (address: string) => `para_confirmed_transactions_${address.toLowerCase()}`;

function getPendingTransactions(walletAddress: string): PendingTransaction[] {
  if (typeof window === "undefined" || !walletAddress) return [];
  try {
    const stored = localStorage.getItem(getPendingStorageKey(walletAddress));
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
    const stored = localStorage.getItem(getConfirmedStorageKey(walletAddress));
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
  if (!pending.some((t) => t.hash === tx.hash)) {
    pending.push(tx);
    savePendingTransactions(walletAddress, pending);
  }
}

export function markTransactionConfirmed(walletAddress: string, hash: string) {
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
    removePendingTransaction(walletAddress, hash);
  }
}

// Clean up old confirmed transactions (older than 1 hour)
function cleanupOldConfirmedTransactions(walletAddress: string) {
  const confirmed = getConfirmedTransactions(walletAddress);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const filtered = confirmed.filter((t) => t.confirmedAt > oneHourAgo);
  if (filtered.length !== confirmed.length) {
    saveConfirmedTransactions(walletAddress, filtered);
  }
}

async function fetchTransactions(address: string, chainId: number): Promise<ChainTransaction[]> {
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

    if (data.status === "0" && data.message?.includes("rate limit")) {
      console.warn(`API limit reached for chain ${chainId}`);
      return [];
    }

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result.filter((tx: ChainTransaction) => !tx.isError || tx.isError === "0");
    }

    return [];
  } catch (error) {
    console.error(`Error fetching transactions for chain ${chainId}:`, error);
    return [];
  }
}

// Simple fingerprint for change detection
function txFingerprint(txs: Transaction[]): string {
  return txs.map((t) => `${t.id}:${t.status}`).sort().join("|");
}

export function useTransactionHistory() {
  const { address: walletAddress } = useEvmWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    cleanupOldConfirmedTransactions(walletAddress);

    let isInitialLoad = true;

    const fetchAllTransactions = async () => {
      if (isInitialLoad) {
        setIsLoading(true);
        isInitialLoad = false;
      }

      const currentPendingTxs = getPendingTransactions(walletAddress);
      const currentPendingHashes = new Set(currentPendingTxs.map((tx) => tx.hash.toLowerCase()));
      const allTxs: Transaction[] = [];
      const confirmedHashes = new Set<string>();

      try {
        const results = await Promise.all(CHAINS.map((chainId) => fetchTransactions(walletAddress, chainId)));

        results.forEach((chainTxs, index) => {
          const chainId = CHAINS[index];

          chainTxs.forEach((tx) => {
            const txHashLower = tx.hash.toLowerCase();

            if (currentPendingHashes.has(txHashLower)) {
              confirmedHashes.add(txHashLower);
              removePendingTransaction(walletAddress, tx.hash);
            }

            const isSend = tx.from.toLowerCase() === walletAddress.toLowerCase();
            const amount = parseFloat(tx.value) / 1e18;

            allTxs.push({
              id: `${chainId}-${tx.hash}`,
              type: isSend ? "send" : "receive",
              amount: amount.toFixed(6),
              symbol: "ETH",
              to: isSend ? tx.to : undefined,
              from: isSend ? undefined : tx.from,
              date: tx.timeStamp,
              status: "confirmed",
              hash: tx.hash,
              chainId,
            });
          });
        });

        // Add pending transactions not yet in explorer
        currentPendingTxs.forEach((pending) => {
          if (!confirmedHashes.has(pending.hash.toLowerCase())) {
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

        // Add confirmed transactions not yet in explorer
        const confirmedTxs = getConfirmedTransactions(walletAddress);
        confirmedTxs.forEach((confirmed) => {
          if (!confirmed.hash || !confirmed.type) return;

          const txHashLower = confirmed.hash.toLowerCase();
          if (!confirmedHashes.has(txHashLower)) {
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
            // Already in explorer, remove from local confirmed list
            const filtered = confirmedTxs.filter((t) => t.hash.toLowerCase() !== txHashLower);
            saveConfirmedTransactions(walletAddress, filtered);
          }
        });

        // Sort by timestamp (newest first) and limit to 30
        allTxs.sort((a, b) => parseInt(b.date) - parseInt(a.date));
        const newTxs = allTxs.slice(0, 30);

        // Only update state if transactions changed
        setTransactions((prev) => (txFingerprint(prev) === txFingerprint(newTxs) ? prev : newTxs));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTransactions();

    const interval = setInterval(fetchAllTransactions, POLL_INTERVAL);

    const handlePendingTxAdded = () => fetchAllTransactions();
    window.addEventListener("pendingTransactionAdded", handlePendingTxAdded);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pendingTransactionAdded", handlePendingTxAdded);
    };
  }, [walletAddress]);

  return { transactions, isLoading };
}
