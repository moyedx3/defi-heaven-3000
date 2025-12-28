"use client";

import Image from "next/image";

// Tax document SVG
const TaxDocumentSVG = () => (
  <svg viewBox="0 0 80 100" className="w-full h-full">
    {/* Paper */}
    <rect x="5" y="5" width="70" height="90" rx="2" fill="#fff" stroke="#ddd" strokeWidth="1" />
    {/* Header - IRS style */}
    <rect x="10" y="10" width="60" height="8" fill="#e8e8e8" />
    <text x="15" y="17" fontSize="5" fill="#666">Form 1040</text>
    {/* Content lines */}
    <rect x="10" y="25" width="50" height="2" fill="#e0e0e0" />
    <rect x="10" y="32" width="55" height="2" fill="#e0e0e0" />
    <rect x="10" y="39" width="40" height="2" fill="#e0e0e0" />
    <rect x="10" y="46" width="58" height="2" fill="#e0e0e0" />
    <rect x="10" y="53" width="35" height="2" fill="#e0e0e0" />
    <rect x="10" y="60" width="48" height="2" fill="#e0e0e0" />
    <rect x="10" y="67" width="52" height="2" fill="#e0e0e0" />
    <rect x="10" y="74" width="30" height="2" fill="#e0e0e0" />
    <rect x="10" y="81" width="45" height="2" fill="#e0e0e0" />
    {/* Checkboxes */}
    <rect x="55" y="31" width="5" height="5" fill="none" stroke="#ccc" strokeWidth="0.5" />
    <rect x="55" y="45" width="5" height="5" fill="none" stroke="#ccc" strokeWidth="0.5" />
    <rect x="55" y="59" width="5" height="5" fill="none" stroke="#ccc" strokeWidth="0.5" />
  </svg>
);

// Generate pattern positions for a diagonal grid
const generatePatternGrid = () => {
  const items: Array<{
    id: string;
    type: "character" | "document";
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }> = [];

  // Create a diagonal repeating pattern
  const spacing = 280; // Space between items
  const rows = 8;
  const cols = 6;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Alternate between character and document
      const isCharacter = (row + col) % 2 === 0;
      
      // Offset every other row for diagonal effect
      const offsetX = row % 2 === 0 ? 0 : spacing / 2;
      
      items.push({
        id: `${row}-${col}`,
        type: isCharacter ? "character" : "document",
        x: col * spacing + offsetX - 100,
        y: row * spacing - 100,
        rotation: -15 + (row * 5 + col * 3) % 30, // Varying rotations
        scale: 0.8 + ((row + col) % 3) * 0.15, // Varying scales
      });
    }
  }

  return items;
};

export function AnimeBackground() {
  const patternItems = generatePatternGrid();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft pink gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #ffe8ed 0%, #ffd6e0 50%, #ffc8d6 100%)",
        }}
      />
      
      {/* Tilted pattern layer */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          transform: "rotate(-5deg)",
        }}
      >
        {patternItems.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none"
            style={{
              left: item.x,
              top: item.y,
              width: item.type === "character" ? 160 : 90,
              height: item.type === "character" ? 220 : 120,
              transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              opacity: item.type === "character" ? 0.08 : 0.06,
              filter: "blur(0.5px)",
            }}
          >
            {item.type === "character" ? (
              <Image
                src="/anime-character.jpg"
                alt=""
                width={160}
                height={220}
                className="w-full h-full object-contain"
                priority={false}
              />
            ) : (
              <TaxDocumentSVG />
            )}
          </div>
        ))}
      </div>

      {/* Floating hearts overlay */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute pointer-events-none text-pink-300"
            style={{
              left: `${8 + i * 8}%`,
              top: `${5 + (i % 4) * 25}%`,
              fontSize: 16 + (i % 3) * 8,
              opacity: 0.15,
              transform: `rotate(${-10 + i * 5}deg)`,
              animation: `floatSlow ${12 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
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

