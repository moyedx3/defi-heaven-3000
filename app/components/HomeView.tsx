"use client";

import { useModal } from "@getpara/react-sdk";
import { BalanceCard } from "./BalanceCard";
import { SendForm } from "./SendForm";

export function HomeView() {
  const { openModal } = useModal();

  return (
    <div className="min-h-screen space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-50" />
          <h1 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Wallet
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Manage
        </button>
      </div>

      {/* Balance Card */}
      <div className="px-4">
        <BalanceCard />
      </div>

      {/* Send Form */}
      <div className="px-4">
        <SendForm />
      </div>
    </div>
  );
}

