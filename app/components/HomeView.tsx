"use client";

import { useModal } from "@getpara/react-sdk";
import { BalanceCard } from "./BalanceCard";
import { SendForm } from "./SendForm";

export function HomeView() {
  const { openModal } = useModal();

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col gap-3 pb-2 relative overflow-hidden">
      {/* Header */}
      <div className="header-bar px-4 py-3 relative z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-heartbeat">💖</span>
            <div>
              <h1 className="anime-title-glow text-xl leading-tight">
                DeFi Heaven
              </h1>
              <p className="text-[10px] text-white/70 font-medium -mt-0.5">Your Crypto Companion</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="anime-button-ghost rounded-xl px-3 py-1.5 text-xs font-bold text-white"
          >
            ⚙️ Manage
          </button>
        </div>
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
