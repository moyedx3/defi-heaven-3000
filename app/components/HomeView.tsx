"use client";

import { useModal } from "@getpara/react-sdk";
import { BalanceCard } from "./BalanceCard";
import { SendForm } from "./SendForm";

export function HomeView() {
  const { openModal } = useModal();

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-2 pb-1 relative overflow-hidden">
      {/* Header */}
      <div className="header-bar px-4 py-2 relative z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-heartbeat">💖</span>
            <div>
              <h1 className="anime-title-glow text-lg leading-tight">
                DeFi Heaven
              </h1>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="anime-button-ghost rounded-lg px-2.5 py-1 text-xs font-bold text-white"
          >
            ⚙️ Manage
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-2 relative z-10 shrink-0">
        <BalanceCard />
      </div>

      {/* Send Form */}
      <div className="px-2 relative z-10 flex-1 min-h-0">
        <SendForm />
      </div>
    </div>
  );
}
