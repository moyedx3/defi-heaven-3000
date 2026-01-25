"use client";

import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { ReceiveCard } from "./ReceiveCard";

export function ReceiveView() {
  const { isConnected } = useParaAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-3">
      <ReceiveCard />
    </div>
  );
}
