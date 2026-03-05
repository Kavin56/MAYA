import SiteNav from "../components/site-nav";

export default function Growth() {
  return (
    <>
      <SiteNav />
      <header className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="neural-pathway w-full h-[300px] -left-1/4 top-1/2 -rotate-12 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-16 md:mb-20">
                <h1 className="text-4xl md:text-6xl lg:text-8xl mb-6 leading-[1.1]">
                  Mindful <span className="text-mist italic font-script">Growth</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-earth-800/80 mb-10 leading-relaxed font-medium">
                  Growth shouldn't mean bloat. MAYA focuses on qualitative evolution, ensuring every new capability is meaningful and sustainable.
                </p>
            </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative">
              <div className="glass-module overflow-hidden aspect-[4/5] relative">
                <img alt="Natural Tech Interface" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKQPWye_7KfhsEeXwOChYISopxY-D6lI3wK3MWWSx0Q6UYoKpnnQ1VMaIweDBC0PQ_4xcDU8A01iY_q9m1K0e-2MRTF6jyXSb26vKDfCzCOtjsHBLTRumnZACwhCon4fgvxgfi4k4vj0gmb38A4U5_-nb327zJv8BeATc4i5zEaVbTfeyknxTc77-Q78aOSvXgqCh6Jjrt7v6gIA0fGTuWp7Zgdy4mfWL4VVD300ENeoBcwaw4q3NdBwOiF5BFOoMb1TON3HgsAehe" />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-900/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="flex items-center gap-3 text-iridescent mb-4">
                    <span className="material-symbols-outlined">psychology_alt</span>
                    <span className="font-bold uppercase tracking-widest text-sm">Vitality Check 98%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-iridescent w-4/5 glow-accent"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-earth-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hidden md:block">
                MINDFUL SHELL
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl lg:text-6xl mb-8 leading-tight">Peace is a <span className="text-mist italic font-script">Vital</span> Constant.</h2>
              <p className="text-earth-800/70 text-lg mb-10 leading-relaxed">
                MAYA filters out the noise of traditional AI. We focus on qualitative growth over quantitative bloat. Your digital presence is treated as a living organism that requires rest and care.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-flora flex items-center justify-center font-bold text-flora group-hover:bg-flora group-hover:text-white transition-all">01</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Local Bloom Processing</h4>
                    <p className="text-sm text-earth-800/50 font-medium">Data stays where it grows—on your own hardware.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-mist flex items-center justify-center font-bold text-mist group-hover:bg-mist group-hover:text-white transition-all">02</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Ethical Sourcing</h4>
                    <p className="text-sm text-earth-800/50 font-medium">Models trained on regenerative, opt-in knowledge.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-bloom flex items-center justify-center font-bold text-bloom group-hover:bg-bloom group-hover:text-white transition-all">03</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Co-Evolutionary Gating</h4>
                    <p className="text-sm text-earth-800/50 font-medium">You guide the growth. AI serves as your digital gardener.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <footer className="bg-earth-900 text-earth-200 py-16 md:py-24 rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-flora organic-shape flex items-center justify-center text-white font-bold">M</div>
                <span className="font-display font-bold text-2xl text-white">MAYA</span>
              </div>
              <p className="text-earth-200/50 text-sm leading-relaxed font-medium">
                Symbiotic AI Growth.<br />Built for the Mindful Future.
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg mb-8 font-display">THE FOREST</h4>
              <ul className="space-y-4 text-sm font-medium text-earth-200/60">
                <li><a className="hover:text-flora transition-colors" href="/symbiosis">Symbiosis</a></li>
                <li><a className="hover:text-flora transition-colors" href="/growth">Growth Cycles</a></li>
                <li><a className="hover:text-flora transition-colors" href="/connection">The Grove</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-earth-200/30 font-bold uppercase tracking-widest">© 2024 MAYA_ECOSYSTEM // FLOW WITH US</p>
          </div>
        </div>
      </footer>
    </>
  );
}
