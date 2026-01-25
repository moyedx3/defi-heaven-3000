"use client";

import { TransactionList } from "./TransactionList";

export function HistoryView() {
  return (
    <div className="h-[calc(100vh-70px)] flex flex-col pb-2 relative overflow-hidden">
      {/* Header */}
      <div className="header-bar px-4 py-3 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-sparkle">✨</span>
          <div>
            <h1 className="anime-title-glow text-xl leading-tight">
              History
            </h1>
            <p className="text-[10px] text-white/70 font-medium -mt-0.5">Your transactions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 px-3 relative z-10 flex-1 min-h-0 overflow-y-auto">
        <TransactionList />
      </div>
    </div>
  );
}
