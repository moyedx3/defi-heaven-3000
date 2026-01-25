"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useEvmWallet } from "../hooks/useEvmWallet";

export function ReceiveCard() {
  const { address } = useEvmWallet();
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
    <div className="relative anime-card rounded-2xl p-4 overflow-hidden">
      <div className="absolute top-2 right-2 text-lg">📱</div>

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="rounded-xl border-3 border-white bg-white p-3">
          <QRCodeSVG value={address} size={160} level="H" />
        </div>

        <div className="w-full">
          <label className="mb-1.5 block anime-subtitle text-[10px] uppercase tracking-wider">
            📍 Your Address
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={address}
              readOnly
              className="flex-1 rounded-xl border-2 border-white bg-white/90 px-3 py-2 font-mono text-xs font-bold text-pink-600"
            />
            <button
              onClick={handleCopy}
              className="anime-button rounded-xl border-2 border-white px-3 py-2 text-xs font-bold text-white"
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
