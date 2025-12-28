"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { HomeView } from "./components/HomeView";
import { ReceiveView } from "./components/ReceiveView";
import { HistoryView } from "./components/HistoryView";
import { BottomNav } from "./components/BottomNav";
import { AnimeBackground } from "./components/AnimeBackground";
import { useModal } from "@getpara/react-sdk";

export default function Home() {
  const [currentView, setCurrentView] = useState("home");
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  if (!isConnected) {
    return (
      <>
        <AnimeBackground />
        <div className="min-h-screen relative z-10">
          <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
            <div className="w-full anime-card rounded-3xl p-10 relative overflow-hidden">
              {/* Decorative sparkles */}
              <div className="absolute top-4 left-4 text-2xl animate-sparkle" style={{ animationDelay: '0s', animationDuration: '3s' }}>✨</div>
              <div className="absolute top-8 right-8 text-xl animate-sparkle" style={{ animationDelay: '1s', animationDuration: '4s' }}>⭐</div>
              <div className="absolute bottom-6 left-8 text-2xl animate-sparkle" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>✨</div>
              
              <div className="mb-8 text-center relative z-10">
                <h1 className="mb-4 anime-title text-4xl text-white">
                  Welcome!
                </h1>
                <p className="text-lg font-bold text-white mb-2">
                  Your wallet awaits your command ♥
                </p>
                <p className="text-sm text-white/90">
                  Connect your wallet to begin your journey
                </p>
              </div>
              <button
                onClick={() => openModal()}
                className="w-full anime-button rounded-2xl px-6 py-4 text-lg font-bold text-white relative z-10"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimeBackground />
      <div className="min-h-screen relative z-10">
        <div className="mx-auto max-w-md">
          <main>
            {currentView === "home" && <HomeView />}
            {currentView === "receive" && <ReceiveView />}
            {currentView === "history" && <HistoryView />}
          </main>
        </div>
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </>
  );
}
