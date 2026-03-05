import SiteNav from "../components/site-nav";

export default function Symbiosis() {
  return (
    <>
      <SiteNav />
      <header className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="neural-pathway w-[200%] rotate-12 -left-1/4 top-1/3"></div>
        <div className="neural-pathway w-[200%] -rotate-6 -left-1/4 bottom-1/4"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
            <h1 className="text-4xl md:text-6xl lg:text-8xl mb-6 leading-[1.1]">
              Organic <span className="text-flora italic font-script">Symbiosis</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-earth-800/80 mb-10 leading-relaxed font-medium">
              We believe in technology that breathes with you. Our symbiotic architecture ensures that as you grow, your digital ecosystem evolves naturally alongside you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="glass-module p-8 md:p-10 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-mist/20 rounded-2xl flex items-center justify-center text-mist mb-8">
                <span className="material-symbols-outlined text-4xl">energy_savings_leaf</span>
              </div>
              <h3 className="text-2xl mb-4">Circular Logic</h3>
              <p className="text-earth-800/70 leading-relaxed mb-6">
                Our AI consumes 40% less energy by utilizing localized growth patterns and efficient pruning of redundant data clusters.
              </p>
              <div className="text-xs font-bold text-mist uppercase tracking-widest">Protocol: GREEN_WAVE</div>
            </div>
            <div className="glass-module p-8 md:p-10 hover:-translate-y-2 transition-transform duration-500 md:mt-12">
              <div className="w-16 h-16 bg-flora/20 rounded-2xl flex items-center justify-center text-flora mb-8">
                <span className="material-symbols-outlined text-4xl">diversity_3</span>
              </div>
              <h3 className="text-2xl mb-4">Deep Roots</h3>
              <p className="text-earth-800/70 leading-relaxed mb-6">
                Total sandbox isolation ensures your identity remains yours. We build fences of light, not walls of stone, around your data garden.
              </p>
              <div className="text-xs font-bold text-flora uppercase tracking-widest">Method: ROOT_LOCK</div>
            </div>
            <div className="glass-module p-8 md:p-10 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-bloom/20 rounded-2xl flex items-center justify-center text-bloom mb-8">
                <span className="material-symbols-outlined text-4xl">hub</span>
              </div>
              <h3 className="text-2xl mb-4">Mycelial Sync</h3>
              <p className="text-earth-800/70 leading-relaxed mb-6">
                Connect with a global community through verified, peer-to-peer pathways. Sharing wisdom through symbiotic automation.
              </p>
              <div className="text-xs font-bold text-bloom uppercase tracking-widest">Network: HYPHAE_VERIFIED</div>
            </div>
          </div>

          <div className="mt-24 glass-module p-8 md:p-12">
             <h2 className="text-3xl md:text-4xl mb-8 text-center">The Symbiotic Cycle</h2>
             <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                    <p className="text-lg leading-relaxed text-earth-800/80 mb-6">
                        Symbiosis in MAYA is not just a buzzword; it is the fundamental architectural principle. Your data feeds the local model, which in turn nurtures your workflow efficiency. This closed-loop system prevents data leakage while maximizing personalized utility.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-flora">check_circle</span>
                            <span>Local-first data processing</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-flora">check_circle</span>
                            <span>Adaptive learning algorithms</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-flora">check_circle</span>
                            <span>Energy-efficient computation</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-earth-100 rounded-3xl h-64 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-pattern opacity-50"></div>
                     <span className="material-symbols-outlined text-6xl md:text-9xl text-flora opacity-20">recycling</span>
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
