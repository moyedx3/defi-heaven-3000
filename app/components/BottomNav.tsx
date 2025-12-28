"use client";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: "○" },
    { id: "receive", label: "Receive", icon: "○" },
    { id: "history", label: "History", icon: "○" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 safe-area-inset-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 transition-colors ${
              currentView === item.id
                ? "text-zinc-900 dark:text-zinc-50"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <span className="text-sm font-medium">{item.label}</span>
            {currentView === item.id && (
              <div className="h-1 w-8 rounded-full bg-zinc-900 dark:bg-zinc-50" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
