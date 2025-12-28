"use client";

import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { ReceiveCard } from "./ReceiveCard";

export function ReceiveView() {
  const { isConnected } = useParaAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col pb-2 relative overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💝</span>
          <h1 className="anime-title text-xl">
            Receive
          </h1>
        </div>
      </div>
      <div className="mt-3 px-3 relative z-10 flex-1 min-h-0 overflow-y-auto">
        <ReceiveCard />
      </div>
    </div>
  );
}

