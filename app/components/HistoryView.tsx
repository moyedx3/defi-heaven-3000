"use client";

import { TransactionList } from "./TransactionList";

export function HistoryView() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-3">
      <h2 className="text-xs font-bold text-white/90 mb-2">📜 Transaction History</h2>
      <div className="flex-1 overflow-y-auto min-h-0">
        <TransactionList />
      </div>
    </div>
  );
}
