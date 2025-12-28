"use client";

import { useModal } from "@getpara/react-sdk";
import { BalanceCard } from "./BalanceCard";
import { SendForm } from "./SendForm";

export function HomeView() {
  const { openModal } = useModal();

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col gap-3 pb-2 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-2xl">💖</div>
          <h1 className="anime-title text-xl">
            Wallet
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="anime-button rounded-xl border-2 border-white px-3 py-1.5 text-xs font-bold text-white hover:scale-105"
        >
          Manage ♥
        </button>
      </div>

      {/* Balance Card */}
      <div className="px-3 relative z-10 shrink-0">
        <BalanceCard />
      </div>

      {/* Send Form - scrollable if needed */}
      <div className="px-3 relative z-10 flex-1 min-h-0 overflow-y-auto">
        <SendForm />
      </div>
    </div>
  );
}

