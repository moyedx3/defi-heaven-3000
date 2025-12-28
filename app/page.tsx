"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { HomeView } from "./components/HomeView";
import { ReceiveView } from "./components/ReceiveView";
import { HistoryView } from "./components/HistoryView";
import { BottomNav } from "./components/BottomNav";
import { AnimeBackground } from "./components/AnimeBackground";
import { useModal } from "@getpara/react-sdk";
import Image from "next/image";

export default function Home() {
  const [currentView, setCurrentView] = useState("home");
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  if (!isConnected) {
    return (
      <>
        <AnimeBackground />
        <div className="min-h-screen relative z-10 overflow-hidden">
          {/* Main character - centered above card on mobile, left side on desktop */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 cursor-pointer group">
            <Image
              src="/char-main.png"
              alt=""
              width={300}
              height={400}
              className="object-contain transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(255,105,180,0.4))',
              }}
              priority
            />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce">
              💖
            </div>
          </div>

          {/* Second character on right - desktop only */}
          <div className="fixed bottom-0 right-0 z-20 hidden md:block cursor-pointer group">
            <Image
              src="/char-1.png"
              alt=""
              width={280}
              height={380}
              className="object-contain transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(255,105,180,0.4))',
                transform: 'scaleX(-1)',
              }}
              priority
            />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce">
              ✨
            </div>
          </div>

          <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 pb-[200px] md:pb-4">
            <div className="w-full anime-card rounded-3xl p-10 relative overflow-hidden">
              {/* Decorative sparkles */}
              <div className="absolute top-4 left-4 text-2xl animate-sparkle" style={{ animationDelay: '0s', animationDuration: '3s' }}>✨</div>
              <div className="absolute top-8 right-8 text-xl animate-sparkle" style={{ animationDelay: '1s', animationDuration: '4s' }}>💖</div>
              <div className="absolute bottom-6 left-8 text-2xl animate-sparkle" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>✨</div>
              
              <div className="mb-8 text-center relative z-10">
                <div className="text-6xl mb-4">💕</div>
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

  // Different character for each view
  const characterSrc = currentView === "home" 
    ? "/char-1.png" 
    : currentView === "receive" 
    ? "/char-main.png" 
    : "/char-2.png";

  return (
    <>
      <AnimeBackground />
      <div className="min-h-screen relative z-10 overflow-hidden">
        {/* Character peeking from bottom-right */}
        <div 
          className="fixed bottom-14 right-0 z-30 transition-all duration-300 cursor-pointer group"
          style={{ transform: 'translateX(25%)' }}
        >
          <Image
            src={characterSrc}
            alt=""
            width={160}
            height={220}
            className="object-contain transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-x-4 group-hover:-translate-y-1"
            style={{ 
              filter: 'drop-shadow(-4px 0 15px rgba(212,20,90,0.4))',
            }}
          />
          <div className="absolute -top-1 left-4 text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce">
            💕
          </div>
        </div>

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
