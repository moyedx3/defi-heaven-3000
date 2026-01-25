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

  const shortAddress = `${address.slice(0, 8)}...${address.slice(-6)}`;

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      {/* QR Code */}
      <div className="bg-white rounded-xl p-3 shadow-lg">
        <QRCodeSVG
          value={address}
          size={140}
          level="H"
          bgColor="#ffffff"
          fgColor="#d4145a"
        />
      </div>

      {/* Address Display */}
      <div className="w-full text-center">
        <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Your Address</div>
        <div className="text-sm font-bold text-white font-mono mb-2">{shortAddress}</div>

        {/* Full address + copy */}
        <div className="bg-white/15 rounded-lg p-2 flex items-center gap-2">
          <input
            type="text"
            value={address}
            readOnly
            className="flex-1 bg-transparent border-none text-[10px] font-mono text-white/90 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
              copied ? "bg-green-500 text-white" : "bg-white text-pink-600"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-white/60 text-center">
        Receive ETH or tokens on any supported network
      </p>
    </div>
  );
}
