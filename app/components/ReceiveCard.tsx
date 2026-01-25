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
    <div className="anime-card rounded-2xl p-5 overflow-hidden">
      {/* Decorative elements */}
      <div className="sparkle top-3 right-3 text-lg" style={{ animationDelay: '0s' }}>✨</div>
      <div className="sparkle bottom-4 left-4 text-lg" style={{ animationDelay: '1s' }}>💫</div>

      <div className="flex flex-col items-center gap-5 relative z-10">
        {/* QR Code */}
        <div className="qr-container">
          <QRCodeSVG
            value={address}
            size={180}
            level="H"
            bgColor="#ffffff"
            fgColor="#d4145a"
          />
        </div>

        {/* Address Display */}
        <div className="w-full">
          <label className="mb-2 block anime-subtitle text-xs uppercase tracking-wider text-center">
            💖 Your Wallet Address
          </label>

          {/* Short address display */}
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-white font-mono tracking-wide">
              {shortAddress}
            </span>
          </div>

          {/* Full address + copy */}
          <div className="anime-card-glass rounded-xl p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 bg-transparent border-none text-xs font-mono text-white/90 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`anime-button rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  copied ? "bg-green-500 border-green-400" : ""
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Copied!</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span>📋</span>
                    <span>Copy</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-xs text-white/60 text-center max-w-xs">
          Share this address to receive ETH or tokens on any supported network
        </p>
      </div>
    </div>
  );
}
