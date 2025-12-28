"use client";

import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";

export function ReceiveCard() {
  const paraAccount = useParaAccount();
  const evmWallet = useMemo(() => {
    if (!paraAccount.isConnected || !paraAccount.embedded?.wallets) return null;
    const wallets = Object.values(paraAccount.embedded.wallets);
    return wallets.find((w: any) => w.type === "EVM");
  }, [paraAccount]);

  const address = evmWallet?.address;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:p-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <QRCodeSVG value={address} size={240} level="H" />
        </div>

        <div className="w-full space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Your Address
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={address}
              readOnly
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <button
              onClick={handleCopy}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

