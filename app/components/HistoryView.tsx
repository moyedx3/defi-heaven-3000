"use client";

import { TransactionList } from "./TransactionList";

export function HistoryView() {
  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-50" />
          <h1 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            History
          </h1>
        </div>
      </div>
      <div className="mt-6 px-4">
        <TransactionList />
      </div>
    </div>
  );
}

