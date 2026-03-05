"use client";

import { useState } from "react";

type SiteNavProps = {
  active?: string;
  stars?: number;
  callUrl?: string;
};

export default function SiteNav(props: SiteNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    // If active prop is provided, check against it
    if (props.active) {
      if (path === "/" && !props.active) return true;
      if (path === "/" + props.active) return true;
      return false;
    }
    return false;
  };

  const linkClass = (path: string) =>
    `transition-colors ${isActive(path) ? "text-flora font-bold" : "text-earth-900 hover:text-flora"}`;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="glass-module px-6 md:px-8 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-flora organic-shape flex items-center justify-center text-white shadow-lg shadow-flora/30">
            <a href="/" className="material-symbols-outlined text-white hover:text-white">eco</a>
          </div>
          <a href="/" className="font-display font-bold text-xl tracking-tight text-earth-900 hover:text-flora transition-colors">MAYA</a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-sm">
          <a className={linkClass("/symbiosis")} href="/symbiosis">Symbiosis</a>
          <a className={linkClass("/growth")} href="/growth">Growth</a>
          <a className={linkClass("/connection")} href="/connection">Connection</a>
          <a className={linkClass("/enterprise")} href="/enterprise">Enterprise</a>
          <a className={linkClass("/den")} href="/den">Den</a>
          <a className={linkClass("/download")} href="/download">Download</a>
          <a className="bg-earth-900 text-white px-5 py-2.5 rounded-full hover:bg-flora transition-all shadow-lg whitespace-nowrap" href="http://localhost:5173">
            Enter Garden
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-earth-900 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-2 md:hidden z-50">
          <div className="glass-module p-6 flex flex-col gap-4 font-semibold text-sm animate-fade-up shadow-2xl">
            <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/symbiosis")}`}
              href="/symbiosis"
              onClick={() => setIsMenuOpen(false)}
            >
              Symbiosis
            </a>
            <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/growth")}`}
              href="/growth"
              onClick={() => setIsMenuOpen(false)}
            >
              Growth
            </a>
            <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/connection")}`}
              href="/connection"
              onClick={() => setIsMenuOpen(false)}
            >
              Connection
            </a>
            <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/enterprise")}`}
              href="/enterprise"
              onClick={() => setIsMenuOpen(false)}
            >
              Enterprise
            </a>
            <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/den")}`}
              href="/den"
              onClick={() => setIsMenuOpen(false)}
            >
              Den
            </a>
             <a 
              className={`py-2 border-b border-earth-200/50 ${linkClass("/download")}`}
              href="/download"
              onClick={() => setIsMenuOpen(false)}
            >
              Download
            </a>
            <a 
              className="bg-earth-900 text-white px-6 py-3 rounded-full hover:bg-flora transition-all shadow-lg text-center mt-2" 
              href="http://localhost:5173"
              onClick={() => setIsMenuOpen(false)}
            >
              Enter Garden
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
