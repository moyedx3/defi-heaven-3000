"use client";

export type ViewType = "home" | "receive" | "history";

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NAV_ITEMS: Array<{ id: ViewType; label: string; icon: string; activeIcon: string }> = [
  { id: "home", label: "Home", icon: "🏠", activeIcon: "💖" },
  { id: "receive", label: "Receive", icon: "📥", activeIcon: "💝" },
  { id: "history", label: "History", icon: "📜", activeIcon: "✨" },
];

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav safe-area-inset-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 ${
                isActive ? "nav-item-active" : ""
              }`}
            >
              <span
                className={`text-xl transition-transform duration-200 ${
                  isActive ? "scale-110 animate-heartbeat" : ""
                }`}
              >
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-[11px] font-semibold transition-all ${
                  isActive
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-white rounded-full shadow-lg"
                     style={{ boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
