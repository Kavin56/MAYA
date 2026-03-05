
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ExploreWoods() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main 
      ref={containerRef}
      className="min-h-screen bg-earth-900 text-white overflow-hidden relative flex items-center justify-center"
      style={{
        perspective: '1000px'
      }}
    >
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="text-white hover:text-flora transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest backdrop-blur-md px-4 py-2 rounded-full bg-black/20">
          <span className="material-symbols-outlined">arrow_back</span> Return
        </Link>
      </div>

      {/* Layer 0: Background - slowest movement */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-earth-900 via-earth-800 to-black transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }}
      ></div>

      {/* Layer 1: Distant Trees */}
      <div 
        className="absolute inset-0 opacity-40 transition-transform duration-100 ease-out flex items-end justify-center pointer-events-none"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) scale(1.05)` }}
      >
        <div className="w-full h-2/3 bg-[url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-bottom mix-blend-overlay"></div>
      </div>

      {/* Layer 2: Mid-ground Elements */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out pointer-events-none"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      >
        <div className="text-[15rem] opacity-5 font-display select-none">MAYA</div>
      </div>

      {/* Layer 3: Foreground - fastest movement (creates depth) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out flex items-center justify-center"
        style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
      >
        <div className="relative z-10 text-center p-12 glass-module rounded-3xl max-w-2xl mx-6 backdrop-blur-md border border-white/10 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-display mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-mist to-flora animate-pulse">
            Deep Woods
          </h1>
          <p className="text-xl text-earth-200/80 mb-8 leading-relaxed">
            In the silence of the forest, the signal becomes clear. Move your mouse to explore the layers of perception.
          </p>
          <div className="flex justify-center gap-4 text-sm font-bold uppercase tracking-widest text-flora">
            <span>x: {mousePos.x.toFixed(2)}</span>
            <span>y: {mousePos.y.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-60 pointer-events-none"></div>
    </main>
  );
}
