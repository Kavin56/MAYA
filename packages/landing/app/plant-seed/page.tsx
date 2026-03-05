
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlantSeed() {
  const [growthStage, setGrowthStage] = useState(0);

  const plantEmojis = ['🌱', '🌿', '🪴', '🌳', '🌲'];
  const messages = [
    "Plant a seed of intention...",
    "It's taking root...",
    "Growing stronger...",
    "Reaching for the light...",
    "A mighty tree stands tall!"
  ];

  const handlePlant = () => {
    if (growthStage < plantEmojis.length - 1) {
      setGrowthStage(prev => prev + 1);
    } else {
      setGrowthStage(0); // Reset or maybe celebrate?
    }
  };

  return (
    <main className="min-h-screen bg-earth-900 text-white flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-earth-800 to-earth-900 z-0"></div>
      <div className="neural-pathway w-[150%] h-[150%] absolute -top-1/4 -left-1/4 opacity-10 animate-pulse z-0"></div>

      <div className="relative z-10 text-center max-w-md w-full">
        <Link href="/" className="absolute top-0 left-0 text-mist hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined">arrow_back</span> Return
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display mb-4"> nurture.grow </h1>
          <p className="text-earth-200/60 font-medium">{messages[growthStage]}</p>
        </div>

        <div 
          onClick={handlePlant}
          className="cursor-pointer select-none transition-all duration-700 ease-spring transform hover:scale-110 active:scale-95 flex items-center justify-center w-64 h-64 mx-auto bg-white/5 rounded-full border border-white/10 shadow-2xl backdrop-blur-sm relative group"
        >
          <div className="absolute inset-0 rounded-full bg-flora/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <span 
            className="text-9xl transition-all duration-500 filter drop-shadow-lg"
            style={{ 
              transform: `scale(${1 + growthStage * 0.2}) translateY(-${growthStage * 10}px)`,
              opacity: 1 
            }}
          >
            {plantEmojis[growthStage]}
          </span>
          
          {growthStage === 0 && (
            <div className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-flora animate-bounce">
              Click to plant
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center gap-2">
          {plantEmojis.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-500 ${idx <= growthStage ? 'w-8 bg-flora' : 'w-2 bg-white/10'}`}
            ></div>
          ))}
        </div>
      </div>
    </main>
  );
}
