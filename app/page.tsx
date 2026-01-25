"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { HomeView } from "./components/HomeView";
import { ReceiveView } from "./components/ReceiveView";
import { HistoryView } from "./components/HistoryView";
import { ViewType } from "./components/BottomNav";
import { AnimeBackground } from "./components/AnimeBackground";
import { useModal } from "@getpara/react-sdk";
import Image from "next/image";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  if (!isConnected) {
    return (
      <>
        <AnimeBackground />
        <div className="min-h-screen relative z-10 overflow-hidden">
          {/* Floating decorative elements */}
          <div className="fixed top-10 left-10 text-4xl animate-sparkle opacity-60" style={{ animationDelay: '0s' }}>✨</div>
          <div className="fixed top-20 right-16 text-3xl animate-sparkle opacity-50" style={{ animationDelay: '0.5s' }}>💫</div>
          <div className="fixed top-40 left-20 text-2xl animate-sparkle opacity-40" style={{ animationDelay: '1s' }}>⭐</div>
          <div className="fixed bottom-40 left-8 text-3xl floating-heart" style={{ animationDelay: '0s' }}>💕</div>
          <div className="fixed bottom-60 right-12 text-2xl floating-heart" style={{ animationDelay: '2s' }}>💖</div>

          {/* Main character - centered above card on mobile, left side on desktop */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 cursor-pointer group">
            <Image
              src="/char-main.png"
              alt=""
              width={320}
              height={420}
              className="object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-3"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255,105,180,0.5))',
              }}
              priority
            />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-2">
              💖
            </div>
          </div>

          {/* Second character on right - desktop only */}
          <div className="fixed bottom-0 right-0 z-20 hidden md:block cursor-pointer group">
            <Image
              src="/char-1.png"
              alt=""
              width={300}
              height={400}
              className="object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-3"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255,105,180,0.5))',
                transform: 'scaleX(-1)',
              }}
              priority
            />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-2">
              ✨
            </div>
          </div>

          <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 pb-[220px] md:pb-4">
            <div className="w-full anime-card-premium rounded-3xl p-8 md:p-10 relative overflow-hidden">
              {/* Corner decorations */}
              <div className="corner-deco corner-deco-tl" />
              <div className="corner-deco corner-deco-br" />

              {/* Decorative sparkles */}
              <div className="sparkle top-4 left-4 text-2xl" style={{ animationDelay: '0s' }}>✨</div>
              <div className="sparkle top-6 right-6 text-xl" style={{ animationDelay: '0.7s' }}>💖</div>
              <div className="sparkle bottom-20 left-6 text-2xl" style={{ animationDelay: '1.4s' }}>✨</div>
              <div className="sparkle bottom-16 right-8 text-lg" style={{ animationDelay: '2.1s' }}>💫</div>

              <div className="mb-8 text-center relative z-10">
                {/* Logo */}
                <div className="text-5xl mb-3 animate-heartbeat">💕</div>

                {/* Title */}
                <h1 className="mb-3 anime-title-glow text-3xl md:text-4xl">
                  DeFi Heaven 3000
                </h1>

                {/* Tagline */}
                <p className="text-base md:text-lg font-bold text-white mb-2 drop-shadow-lg">
                  Your gateway to decentralized bliss ♥
                </p>

                {/* Subtitle */}
                <p className="text-sm text-white/80 max-w-xs mx-auto">
                  Connect your wallet to begin your journey through the cosmos of crypto
                </p>
              </div>

              {/* Connect Button */}
              <button
                onClick={() => openModal()}
                className="w-full anime-button rounded-2xl px-6 py-4 text-lg font-bold text-white relative z-10"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Connect Wallet</span>
                  <span className="text-xl">💫</span>
                </span>
              </button>

              {/* Powered by */}
              <p className="mt-4 text-center text-xs text-white/60 relative z-10">
                Powered by Para MPC • Secure & Non-Custodial
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Different character for each view with smooth transitions
  const characterConfig = {
    home: { src: "/char-1.png", emoji: "💖" },
    receive: { src: "/char-main.png", emoji: "💝" },
    history: { src: "/char-2.png", emoji: "✨" },
  };

  const { src: characterSrc, emoji: characterEmoji } = characterConfig[currentView];

  const NAV_ITEMS: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "receive", label: "Receive", icon: "📥" },
    { id: "history", label: "History", icon: "📜" },
  ];

  return (
    <>
      <AnimeBackground />
      <div className="min-h-screen relative z-10 overflow-hidden flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="fixed top-4 right-4 text-2xl animate-sparkle opacity-40 pointer-events-none">✨</div>
        <div className="fixed top-20 left-4 text-xl floating-heart opacity-30 pointer-events-none">💕</div>

        {/* Character peeking from bottom-right */}
        <div
          className="fixed bottom-4 right-0 z-30 transition-all duration-500 cursor-pointer group"
          style={{ transform: 'translateX(30%)' }}
        >
          <Image
            src={characterSrc}
            alt=""
            width={120}
            height={160}
            className="object-contain transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-x-6"
            style={{
              filter: 'drop-shadow(-6px 0 20px rgba(212,20,90,0.5))',
            }}
          />
          <div className="absolute -top-2 left-2 text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1">
            {characterEmoji}
          </div>
        </div>

        <div className="mx-auto max-w-md w-full px-3">
          <main className="animate-slide-up wallet-container rounded-2xl overflow-hidden">
            {/* Inline Tab Navigation */}
            <nav className="tab-nav flex items-center justify-around px-2 py-2">
              {NAV_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`tab-item flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      isActive ? "tab-item-active" : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className={isActive ? "animate-pulse" : ""}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div className="wallet-content">
              {currentView === "home" && <HomeView />}
              {currentView === "receive" && <ReceiveView />}
              {currentView === "history" && <HistoryView />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
