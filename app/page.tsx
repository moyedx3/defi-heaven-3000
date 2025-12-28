"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { HomeView } from "./components/HomeView";
import { ReceiveView } from "./components/ReceiveView";
import { HistoryView } from "./components/HistoryView";
import { BottomNav } from "./components/BottomNav";
import { useModal } from "@getpara/react-sdk";

export default function Home() {
  const [currentView, setCurrentView] = useState("home");
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-zinc-200/50 bg-white p-10 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connect your wallet to get started
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="w-full rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:shadow-sm dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-md">
        <main>
          {currentView === "home" && <HomeView />}
          {currentView === "receive" && <ReceiveView />}
          {currentView === "history" && <HistoryView />}
        </main>
      </div>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}
