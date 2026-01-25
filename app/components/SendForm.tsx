"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSendTransaction, useWaitForTransactionReceipt, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { parseEther, parseUnits, isAddress, erc20Abi } from "viem";
import { mainnet, sepolia, base, arbitrum } from "wagmi/chains";
import { useEvmWallet } from "../hooks/useEvmWallet";
import { useEthPrice } from "../hooks/useEthPrice";
import { addPendingTransaction, markTransactionConfirmed } from "../hooks/useTransactionHistory";

interface Token {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  addresses?: {
    [chainId: number]: `0x${string}`;
  };
}

// USDC addresses for different chains
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [sepolia.id]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

const TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isNative: false,
    addresses: USDC_ADDRESSES,
  },
];

const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: "Ethereum", symbol: "ETH" },
  { id: sepolia.id, name: "Sepolia", symbol: "ETH" },
  { id: base.id, name: "Base", symbol: "ETH" },
  { id: arbitrum.id, name: "Arbitrum", symbol: "ETH" },
];

export function SendForm() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountType, setAmountType] = useState<"ETH" | "USD">("ETH");

  const { address: walletAddress } = useEvmWallet();
  const { ethPrice } = useEthPrice();

  // Store transaction details when submitting
  const pendingTxRef = useRef<{ to: string; amount: string; symbol: string; chainId: number } | null>(null);

  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const currentChain = SUPPORTED_CHAINS.find((chain) => chain.id === currentChainId) || SUPPORTED_CHAINS[0];

  // Native token transaction (ETH)
  const {
    data: hash,
    sendTransaction,
    isPending: isSending,
    error: sendError,
    reset: resetNativeTx,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  // ERC20 token transaction (USDC)
  const {
    writeContract,
    data: contractHash,
    isPending: isContractSending,
    error: contractError,
    reset: resetContractTx,
  } = useWriteContract();

  const {
    isLoading: isContractConfirming,
    isSuccess: isContractConfirmed,
  } = useWaitForTransactionReceipt({ hash: contractHash });

  // Use contract transaction if ERC20, otherwise use native
  const isNativeTx = selectedToken.isNative;
  const activeHash = isNativeTx ? hash : contractHash;
  const activeIsSending = isNativeTx ? isSending : isContractSending;
  const activeIsConfirming = isNativeTx ? isConfirming : isContractConfirming;
  const activeIsConfirmed = isNativeTx ? isConfirmed : isContractConfirmed;
  const activeError = isNativeTx ? sendError : contractError;

  // Convert amount based on selected type
  const getEthAmount = (inputAmount: string): string => {
    if (!inputAmount || isNaN(parseFloat(inputAmount)) || parseFloat(inputAmount) <= 0) {
      return "0";
    }

    if (amountType === "USD" && ethPrice) {
      const ethValue = parseFloat(inputAmount) / ethPrice;
      return ethValue.toFixed(18).replace(/\.?0+$/, "");
    }

    const ethValue = parseFloat(inputAmount);
    if (isNaN(ethValue) || ethValue <= 0) {
      return "0";
    }
    return ethValue.toFixed(18).replace(/\.?0+$/, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount || isSubmitting) return;

    if (!isAddress(to)) return;

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return;

    // For USDC, we can't use USD input type
    if (!selectedToken.isNative && amountType === "USD") return;

    setIsSubmitting(true);

    const ethAmount = getEthAmount(amount);
    if (parseFloat(ethAmount) <= 0) {
      setIsSubmitting(false);
      return;
    }

    pendingTxRef.current = {
      to,
      amount: ethAmount,
      symbol: selectedToken.symbol,
      chainId: currentChainId,
    };

    try {
      if (selectedToken.isNative) {
        if (!sendTransaction) throw new Error("Send transaction not available");
        sendTransaction({
          to: to as `0x${string}`,
          value: parseEther(ethAmount),
        });
      } else {
        const tokenAddress = selectedToken.addresses?.[currentChainId];
        if (!tokenAddress) throw new Error(`USDC not supported on this network`);
        if (!writeContract) throw new Error("Write contract not available");

        writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [to as `0x${string}`, parseUnits(amount, selectedToken.decimals)],
        });
      }
    } catch (error) {
      console.error("Send error:", error);
      setIsSubmitting(false);
      pendingTxRef.current = null;
    }
  };

  // Mark transaction as confirmed
  useEffect(() => {
    if (activeIsConfirmed && activeHash && walletAddress) {
      markTransactionConfirmed(walletAddress, activeHash);
      window.dispatchEvent(new CustomEvent("pendingTransactionAdded"));
    }
  }, [activeIsConfirmed, activeHash, walletAddress]);

  // Add pending transaction when hash becomes available
  useEffect(() => {
    if (activeHash && !activeIsConfirmed && pendingTxRef.current && walletAddress) {
      const txDetails = pendingTxRef.current;
      const storageKey = `para_pending_transactions_${walletAddress.toLowerCase()}`;
      const pending = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const alreadyAdded = pending.some((tx: { hash: string }) => tx.hash === activeHash);

      if (!alreadyAdded) {
        addPendingTransaction(walletAddress, {
          hash: activeHash as `0x${string}`,
          chainId: txDetails.chainId,
          to: txDetails.to as `0x${string}`,
          amount: txDetails.amount,
          symbol: txDetails.symbol,
          type: "send",
          timestamp: Math.floor(Date.now() / 1000),
        });
        window.dispatchEvent(new CustomEvent("pendingTransactionAdded"));
        pendingTxRef.current = null;
      }
    }
  }, [activeHash, activeIsConfirmed, walletAddress]);

  // Reset form on successful transaction
  useEffect(() => {
    if ((isConfirmed || isContractConfirmed) && activeHash) {
      const timer = setTimeout(() => {
        setTo("");
        setAmount("");
        setIsSubmitting(false);
        pendingTxRef.current = null;
        if (isNativeTx) {
          resetNativeTx?.();
        } else {
          resetContractTx?.();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, isContractConfirmed, activeHash, isNativeTx, resetNativeTx, resetContractTx]);

  // Check if token is available on current chain
  const isTokenAvailable = selectedToken.isNative || !!selectedToken.addresses?.[currentChainId];

  const isValidAddress = to.length === 42 && isAddress(to);
  const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  const canSubmitWithUsd = selectedToken.isNative && amountType === "USD" ? ethPrice !== null : true;

  // Calculate equivalent amount for display
  const displayEquivalent = useMemo(() => {
    if (!amount || !isValidAmount) return null;

    if (amountType === "USD" && selectedToken.isNative && ethPrice) {
      const ethAmount = parseFloat(amount) / ethPrice;
      return `${ethAmount.toFixed(6)} ETH`;
    } else if (amountType === "ETH" && selectedToken.isNative && ethPrice) {
      const usdAmount = parseFloat(amount) * ethPrice;
      return `$${usdAmount.toFixed(2)}`;
    }

    return null;
  }, [amount, amountType, selectedToken.isNative, ethPrice, isValidAmount]);

  const isLoading = activeIsSending || activeIsConfirming || isSubmitting;

  return (
    <div className="relative anime-card rounded-2xl p-4 overflow-hidden">
      <div className="absolute top-2 right-2 text-lg">💸</div>

      <h2 className="mb-3 anime-title text-lg relative z-10">
        Send ♥
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
        {/* Chain Selector */}
        <div>
          <label
            htmlFor="chain"
            className="mb-1.5 block anime-subtitle text-[10px] uppercase tracking-wider"
          >
            🌐 Network
          </label>
          <select
            id="chain"
            value={currentChainId}
            onChange={(e) => {
              const chainId = parseInt(e.target.value);
              if (switchChain) switchChain({ chainId });
            }}
            className="w-full rounded-xl border-2 border-white bg-white/90 px-3 py-2 text-sm font-bold text-pink-600 transition-all focus:border-pink-400 focus:outline-none"
            disabled={isLoading || !switchChain}
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Token Selector */}
        <div>
          <label
            htmlFor="token"
            className="mb-1.5 block anime-subtitle text-[10px] uppercase tracking-wider"
          >
            💎 Token
          </label>
          <select
            id="token"
            value={selectedToken.symbol}
            onChange={(e) => {
              const token = TOKENS.find((t) => t.symbol === e.target.value);
              if (token) {
                setSelectedToken(token);
                if (!token.isNative) setAmountType("ETH");
              }
            }}
            className="w-full rounded-xl border-2 border-white bg-white/90 px-3 py-2 text-sm font-bold text-pink-600 transition-all focus:border-pink-400 focus:outline-none"
            disabled={isLoading}
          >
            {TOKENS.map((token) => {
              const available = token.isNative || !!token.addresses?.[currentChainId];
              return (
                <option key={token.symbol} value={token.symbol} disabled={!available}>
                  {token.name} ({token.symbol}){!available ? " - Not available on this network" : ""}
                </option>
              );
            })}
          </select>
          {!isTokenAvailable && !selectedToken.isNative && (
            <p className="mt-2 text-xs font-bold text-yellow-300">
              ⚠️ {selectedToken.symbol} is not available on {currentChain.name}
            </p>
          )}
        </div>

        {/* Recipient Address */}
        <div>
          <label
            htmlFor="recipient"
            className="mb-1.5 block anime-subtitle text-[10px] uppercase tracking-wider"
          >
            📬 Address
          </label>
          <input
            id="recipient"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border-2 border-white bg-white/90 px-3 py-2 font-mono text-sm font-bold placeholder-pink-300 transition-all focus:border-pink-400 focus:outline-none"
            style={{ color: '#db2777' }}
            disabled={isLoading}
          />
          {to && !isValidAddress && (
            <p className="mt-2 text-xs font-bold text-red-300">❌ Invalid address format</p>
          )}
        </div>

        {/* Amount with Type Selector (only for ETH) */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="amount"
              className="block anime-subtitle text-[10px] uppercase tracking-wider"
            >
              💵 Amount
            </label>
            {selectedToken.isNative && (
              <div className="flex gap-1 bg-white/20 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setAmountType("USD")}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                    amountType === "USD"
                      ? "bg-white text-pink-600"
                      : "text-white/80 hover:bg-white/20"
                  }`}
                  disabled={isLoading}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setAmountType("ETH")}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                    amountType === "ETH"
                      ? "bg-white text-pink-600"
                      : "text-white/80 hover:bg-white/20"
                  }`}
                  disabled={isLoading}
                >
                  ETH
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border-2 border-white bg-white/90 px-3 py-2 pr-16 text-sm font-bold text-pink-600 placeholder-pink-300 transition-all focus:border-pink-400 focus:outline-none"
              disabled={isLoading}
            />
            {!selectedToken.isNative && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pink-600">
                {selectedToken.symbol}
              </div>
            )}
          </div>
          {displayEquivalent && (
            <p className="mt-1 text-[10px] font-bold text-white/90">
              ≈ {displayEquivalent}
            </p>
          )}
        </div>

        {/* Error/Success Messages */}
        {activeError && (
          <div className="rounded-xl border border-red-400 bg-red-500/90 px-3 py-2 text-xs font-bold text-white">
            ❌ {activeError.message || "Transaction failed"}
          </div>
        )}
        {activeIsConfirmed && activeHash && (
          <div className="rounded-xl border border-green-400 bg-green-500/90 px-3 py-2 text-xs font-bold text-white">
            <div>✅ Confirmed!</div>
            <div className="font-mono text-[10px] mt-1 break-all">{activeHash}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            !isValidAddress ||
            !isValidAmount ||
            isLoading ||
            !isTokenAvailable ||
            (!sendTransaction && !writeContract) ||
            !canSubmitWithUsd
          }
          className="w-full anime-button rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Sending..."
            : activeIsConfirmed
            ? "Sent! ♥"
            : `Send ${selectedToken.symbol} ♥`}
        </button>
      </form>
    </div>
  );
}
