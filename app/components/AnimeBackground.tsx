"use client";

import Image from "next/image";

const CHARACTER_IMAGES = ["/char-main.png", "/char-1.png", "/char-2.png"];

const HeartSVG = ({ color = "#ff69b4" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
      opacity="0.6"
    />
  </svg>
);

interface DecoItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

interface CharItem {
  id: string;
  charIndex: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Pre-computed patterns (computed once at module load, not on every render)
const DECO_ITEMS: DecoItem[] = (() => {
  const items: DecoItem[] = [];
  const spacing = 200;
  const rows = 10;
  const cols = 8;
  const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffd1dc"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : spacing / 2;
      items.push({
        id: `deco-${row}-${col}`,
        x: col * spacing + offsetX - 50,
        y: row * spacing - 50,
        rotation: -15 + ((row * 7 + col * 11) % 30),
        scale: 0.6 + ((row + col) % 3) * 0.3,
        color: colors[(row + col) % colors.length],
      });
    }
  }
  return items;
})();

const CHAR_ITEMS: CharItem[] = (() => {
  const items: CharItem[] = [];
  const spacing = 400;
  const rows = 6;
  const cols = 5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : spacing / 2;
      items.push({
        id: `char-${row}-${col}`,
        charIndex: (row + col) % CHARACTER_IMAGES.length,
        x: col * spacing + offsetX - 100,
        y: row * spacing - 100,
        rotation: -12 + ((row * 5 + col * 7) % 24),
        scale: 0.5 + ((row + col) % 3) * 0.15,
      });
    }
  }
  return items;
})();

const FLOATING_HEARTS = Array.from({ length: 12 }, (_, i) => ({
  id: `heart-${i}`,
  left: `${8 + i * 8}%`,
  top: `${5 + (i % 4) * 25}%`,
  fontSize: 16 + (i % 3) * 8,
  rotation: -10 + i * 5,
  animationDuration: `${12 + i * 2}s`,
  animationDelay: `${i * 0.5}s`,
}));

export function AnimeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft pink gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #ffe8ed 0%, #ffd6e0 50%, #ffc8d6 100%)",
        }}
      />

      {/* Tilted character pattern layer */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-15%",
          left: "-15%",
          width: "130%",
          height: "130%",
          transform: "rotate(-8deg)",
        }}
      >
        {CHAR_ITEMS.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none"
            style={{
              left: item.x,
              top: item.y,
              width: 180,
              height: 240,
              transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              opacity: 0.06,
            }}
          >
            <Image
              src={CHARACTER_IMAGES[item.charIndex]}
              alt=""
              width={180}
              height={240}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Hearts overlay pattern */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          transform: "rotate(-5deg)",
        }}
      >
        {DECO_ITEMS.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none"
            style={{
              left: item.x,
              top: item.y,
              width: 30,
              height: 30,
              transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              opacity: 0.1,
            }}
          >
            <HeartSVG color={item.color} />
          </div>
        ))}
      </div>

      {/* Floating hearts overlay */}
      <div className="absolute inset-0">
        {FLOATING_HEARTS.map((heart) => (
          <div
            key={heart.id}
            className="absolute pointer-events-none text-pink-300"
            style={{
              left: heart.left,
              top: heart.top,
              fontSize: heart.fontSize,
              opacity: 0.15,
              transform: `rotate(${heart.rotation}deg)`,
              animation: `floatSlow ${heart.animationDuration} ease-in-out infinite`,
              animationDelay: heart.animationDelay,
            }}
          >
            ♥
          </div>
        ))}
      </div>

      {/* Subtle diagonal lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            #ff69b4 50px,
            #ff69b4 51px
          )`,
        }}
      />
    </div>
  );
}
