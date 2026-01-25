"use client";

import { useModal } from "@getpara/react-sdk";
import { BalanceCard } from "./BalanceCard";
import { SendForm } from "./SendForm";

export function HomeView() {
  const { openModal } = useModal();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Balance + Settings Row */}
      <div className="px-3 py-2 shrink-0">
        <div className="flex items-start justify-between">
          <BalanceCard />
          <button
            onClick={() => openModal()}
            className="anime-button-ghost rounded-lg px-2 py-1 text-[10px] font-bold text-white shrink-0"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Send Form */}
      <div className="px-3 pb-3 flex-1 min-h-0">
        <SendForm />
      </div>
    </div>
  );
}
