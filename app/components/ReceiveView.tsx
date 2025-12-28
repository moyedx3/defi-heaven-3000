"use client";

import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { ReceiveCard } from "./ReceiveCard";

export function ReceiveView() {
  const { isConnected } = useParaAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-50" />
          <h1 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Receive
          </h1>
        </div>
      </div>
      <div className="mt-6 px-4">
        <ReceiveCard />
      </div>
    </div>
  );
}

