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

const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [sepolia.id]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", decimals: 18, isNative: true },
  { symbol: "USDC", name: "USD Coin", decimals: 6, isNative: false, addresses: USDC_ADDRESSES },
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
  const pendingTxRef = useRef<{ to: string; amount: string; symbol: string; chainId: number } | null>(null);

  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const currentChain = SUPPORTED_CHAINS.find((chain) => chain.id === currentChainId) || SUPPORTED_CHAINS[0];

  const { data: hash, sendTransaction, isPending: isSending, error: sendError, reset: resetNativeTx } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { writeContract, data: contractHash, isPending: isContractSending, error: contractError, reset: resetContractTx } = useWriteContract();
  const { isLoading: isContractConfirming, isSuccess: isContractConfirmed } = useWaitForTransactionReceipt({ hash: contractHash });

  const isNativeTx = selectedToken.isNative;
  const activeHash = isNativeTx ? hash : contractHash;
  const activeIsSending = isNativeTx ? isSending : isContractSending;
  const activeIsConfirming = isNativeTx ? isConfirming : isContractConfirming;
  const activeIsConfirmed = isNativeTx ? isConfirmed : isContractConfirmed;
  const activeError = isNativeTx ? sendError : contractError;

  const getEthAmount = (inputAmount: string): string => {
    if (!inputAmount || isNaN(parseFloat(inputAmount)) || parseFloat(inputAmount) <= 0) return "0";
    if (amountType === "USD" && ethPrice) return (parseFloat(inputAmount) / ethPrice).toFixed(18).replace(/\.?0+$/, "");
    const ethValue = parseFloat(inputAmount);
    if (isNaN(ethValue) || ethValue <= 0) return "0";
    return ethValue.toFixed(18).replace(/\.?0+$/, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount || isSubmitting || !isAddress(to)) return;
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return;
    if (!selectedToken.isNative && amountType === "USD") return;

    setIsSubmitting(true);
    const ethAmount = getEthAmount(amount);
    if (parseFloat(ethAmount) <= 0) { setIsSubmitting(false); return; }

    pendingTxRef.current = { to, amount: ethAmount, symbol: selectedToken.symbol, chainId: currentChainId };

    try {
      if (selectedToken.isNative) {
        if (!sendTransaction) throw new Error("Send transaction not available");
        sendTransaction({ to: to as `0x${string}`, value: parseEther(ethAmount) });
      } else {
        const tokenAddress = selectedToken.addresses?.[currentChainId];
        if (!tokenAddress || !writeContract) throw new Error(`Token not available`);
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

  useEffect(() => {
    if (activeIsConfirmed && activeHash && walletAddress) {
      markTransactionConfirmed(walletAddress, activeHash);
      window.dispatchEvent(new CustomEvent("pendingTransactionAdded"));
    }
  }, [activeIsConfirmed, activeHash, walletAddress]);

  useEffect(() => {
    if (activeHash && !activeIsConfirmed && pendingTxRef.current && walletAddress) {
      const txDetails = pendingTxRef.current;
      const storageKey = `para_pending_transactions_${walletAddress.toLowerCase()}`;
      const pending = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!pending.some((tx: { hash: string }) => tx.hash === activeHash)) {
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

  useEffect(() => {
    if ((isConfirmed || isContractConfirmed) && activeHash) {
      const timer = setTimeout(() => {
        setTo(""); setAmount(""); setIsSubmitting(false); pendingTxRef.current = null;
        if (isNativeTx) resetNativeTx?.(); else resetContractTx?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, isContractConfirmed, activeHash, isNativeTx, resetNativeTx, resetContractTx]);

  const isTokenAvailable = selectedToken.isNative || !!selectedToken.addresses?.[currentChainId];
  const isValidAddress = to.length === 42 && isAddress(to);
  const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  const canSubmitWithUsd = selectedToken.isNative && amountType === "USD" ? ethPrice !== null : true;

  const displayEquivalent = useMemo(() => {
    if (!amount || !isValidAmount) return null;
    if (amountType === "USD" && selectedToken.isNative && ethPrice) return `${(parseFloat(amount) / ethPrice).toFixed(6)} ETH`;
    if (amountType === "ETH" && selectedToken.isNative && ethPrice) return `$${(parseFloat(amount) * ethPrice).toFixed(2)}`;
    return null;
  }, [amount, amountType, selectedToken.isNative, ethPrice, isValidAmount]);

  const isLoading = activeIsSending || activeIsConfirming || isSubmitting;

  return (
    <div className="anime-card rounded-2xl p-3 h-full flex flex-col">
      <h2 className="text-xs font-bold text-white/90 mb-2">💸 Send</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 flex-1">
        {/* Network & Token Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-white/70 uppercase tracking-wider mb-1">Network</label>
            <select
              value={currentChainId}
              onChange={(e) => switchChain?.({ chainId: parseInt(e.target.value) })}
              className="w-full rounded-lg border-2 border-white/80 bg-white/90 px-2 py-1.5 text-xs font-bold text-pink-600"
              disabled={isLoading}
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-white/70 uppercase tracking-wider mb-1">Token</label>
            <select
              value={selectedToken.symbol}
              onChange={(e) => {
                const token = TOKENS.find((t) => t.symbol === e.target.value);
                if (token) { setSelectedToken(token); if (!token.isNative) setAmountType("ETH"); }
              }}
              className="w-full rounded-lg border-2 border-white/80 bg-white/90 px-2 py-1.5 text-xs font-bold text-pink-600"
              disabled={isLoading}
            >
              {TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol} disabled={!token.isNative && !token.addresses?.[currentChainId]}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-[9px] text-white/70 uppercase tracking-wider mb-1">To Address</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border-2 border-white/80 bg-white/90 px-2 py-1.5 font-mono text-xs font-bold text-pink-600 placeholder-pink-300"
            disabled={isLoading}
          />
          {to && !isValidAddress && <p className="text-[10px] text-red-300 mt-0.5">Invalid address</p>}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-white/70 uppercase tracking-wider">Amount</label>
            {selectedToken.isNative && (
              <div className="flex gap-0.5 bg-white/20 rounded p-0.5">
                {["USD", "ETH"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAmountType(type as "USD" | "ETH")}
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${amountType === type ? "bg-white text-pink-600" : "text-white/70"}`}
                    disabled={isLoading}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border-2 border-white/80 bg-white/90 px-2 py-1.5 text-xs font-bold text-pink-600 placeholder-pink-300"
            disabled={isLoading}
          />
          {displayEquivalent && <p className="text-[9px] text-white/80 mt-0.5">≈ {displayEquivalent}</p>}
        </div>

        {/* Messages */}
        {activeError && (
          <div className="rounded-lg bg-red-500/80 px-2 py-1.5 text-[10px] font-bold text-white">
            ❌ {activeError.message?.slice(0, 50) || "Failed"}
          </div>
        )}
        {activeIsConfirmed && (
          <div className="rounded-lg bg-green-500/80 px-2 py-1.5 text-[10px] font-bold text-white">
            ✅ Confirmed!
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValidAddress || !isValidAmount || isLoading || !isTokenAvailable || !canSubmitWithUsd}
          className="anime-button rounded-xl py-2 text-sm font-bold text-white mt-auto disabled:opacity-50"
        >
          {isLoading ? "Sending..." : activeIsConfirmed ? "Sent! ♥" : `Send ${selectedToken.symbol}`}
        </button>
      </form>
    </div>
  );
}
