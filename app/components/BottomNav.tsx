"use client";

export type ViewType = "home" | "receive" | "history";

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NAV_ITEMS: Array<{ id: ViewType; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "receive", label: "Receive", icon: "♥" },
  { id: "history", label: "History", icon: "📜" },
];

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-white bg-gradient-to-t from-[#d4145a] to-[#ff69b4] safe-area-inset-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-1 flex-col items-center gap-0 rounded-xl px-2 py-1.5 transition-all ${
              currentView === item.id
                ? "bg-white/25"
                : "hover:bg-white/15"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-semibold text-white">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
