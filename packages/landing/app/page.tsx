import Link from "next/link";
import SiteNav from "./components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <header className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="neural-pathway w-[200%] rotate-12 -left-1/4 top-1/3"></div>
        <div className="neural-pathway w-[200%] -rotate-6 -left-1/4 bottom-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-mist/10 text-mist px-4 py-1.5 rounded-full mb-8 font-bold text-sm">
              <span className="w-2 h-2 bg-mist rounded-full animate-pulse"></span>
              ECOLOGICAL AI INTERFACE
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl mb-6 leading-[1.1]">
              Your <br />
              <span className="text-flora italic font-script">AI Digital</span> <br />
              partner
            </h1>
            <p className="text-lg md:text-xl max-w-lg text-earth-800/80 mb-10 leading-relaxed font-medium">
              Maya is a living digital ecosystem designed for the mindful technologist. We trade rigid protocols for natural growth, ensuring your data blossoms in a private, protected garden.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/plant-seed" className="px-10 py-4 bg-bloom text-white font-bold text-lg rounded-full shadow-2xl shadow-bloom/40 hover:scale-105 transition-transform w-full sm:w-auto text-center inline-block">
                Plant Your Seed
              </Link>
              <Link href="/explore-woods" className="px-10 py-4 border-2 border-earth-200 text-earth-800 font-bold text-lg rounded-full hover:bg-white/50 transition-colors w-full sm:w-auto text-center inline-block">
                Explore Woods
              </Link>
            </div>
          </div>
          <div className="relative group mt-10 lg:mt-0">
            <div className="absolute -inset-10 bg-iridescent/30 blur-3xl rounded-full"></div>
            <div className="relative p-4 organic-shape aspect-square flex items-center justify-center overflow-hidden animate-float">
              <div className="relative w-full h-full flex items-center justify-center">
                <img alt="Abstract Data Stream" className="w-4/5 h-4/5 object-contain opacity-90 mix-blend-multiply" src="/maya-hero.png" />
              </div>
              <div className="absolute bottom-12 right-12 text-right">
                <p className="text-xs font-bold text-mist uppercase tracking-widest mb-1">Ecosystem Status</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-flora text-glow">FLOURISHING</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="relative py-20 md:py-32" id="symbiosis">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl lg:text-6xl mb-6">Organic Foundation</h2>
            <p className="text-earth-800/60 font-script text-2xl md:text-3xl">Mindful digital stewardship</p>
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
        </div>
      </section>
      <section className="py-20 md:py-32 relative overflow-hidden" id="growth">
        <div className="neural-pathway w-full h-[300px] -left-1/4 top-1/2 -rotate-12 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
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
              <div className="absolute -top-6 -right-6 bg-earth-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hidden md:block animate-pulse-slow">
                MINDFUL SHELL
              </div>
            </div>
            <div className="relative z-10 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">Peace is a <span className="text-mist italic font-script">Vital</span> Constant.</h2>
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
      </section>
      <section className="bg-mist/10 py-20 md:py-32 relative" id="connection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl lg:text-7xl mb-6">Harvesting Wisdom</h2>
              <p className="text-mist font-bold uppercase tracking-[0.2em] text-sm">12,400+ Flourishing Minds in our Ecosystem</p>
            </div>
            <div className="font-script text-6xl md:text-9xl text-flora opacity-20">Cycle 04</div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            <div className="glass-module p-8 md:p-10 hover:shadow-2xl transition-all hover:bg-white/60">
              <div className="flex items-center gap-4 mb-8">
                <img alt="Member" className="w-16 h-16 organic-shape ring-4 ring-flora/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAJRmrXd3J3IPv5pSuwdC34WfhjmFMdXLb5eSLx51-utJfU26cOZPp3Q0JX3Zt24kBtX9ll-SLim7DepmbDh9yu35DreDO0FLJ_47eLVGbcbwLEe1Qm_kOphiTr7tXdOTuwcNu1UMKwm1jJI6leSoBlhmect1M2IGgn1Dm0o-ssmWH2Qg6EVrplN3W-r_OxZKNucCvlNSEDLIW6UbnKkGvV8SYuV-A3ZSH0Bl18ZGV0DFkXrj63NbaT6n1l2zr8HJ2RO2eAxJ42Lax" />
                <div>
                  <h5 className="font-bold text-earth-900">River Jenkins</h5>
                  <p className="text-xs text-earth-800/40 font-bold uppercase">Zen Architect</p>
                </div>
              </div>
              <p className="text-earth-800/70 italic leading-relaxed text-lg">&quot;The flow of information here feels natural, not forced. It&apos;s the first time tech has helped me breathe deeper.&quot;</p>
            </div>
            <div className="glass-module p-8 md:p-10 hover:shadow-2xl transition-all hover:bg-white/60 md:mt-8">
              <div className="flex items-center gap-4 mb-8">
                <img alt="Member" className="w-16 h-16 organic-shape ring-4 ring-mist/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeTl7IVh86QqlP63q7OmEiWTrXHD8HOSllRja2TZRTFws6yjrRxzjent7JxGY5t-tl7Pe2QaF27e9fczBcjrgFNQgD2Wipc8N5DMCIv6OR2cTkI8ah6ItsO-qdxC4Vrrj7eGmXvsFOaC03BKDzny-KOeMIoANgmZyYxcZ5Oa9XPGeO9blgI47i1hOm7OPGmvA3pGQWA80Zj3FzVk5O-F4OUw9C1Q2NQ-l3WGbmhaF7wSY7TRMEPZipkVBw60XoL2opPljLBo9UpDAD" />
                <div>
                  <h5 className="font-bold text-earth-900">Satoshi Moon</h5>
                  <p className="text-xs text-earth-800/40 font-bold uppercase">Symbiosis Dev</p>
                </div>
              </div>
              <p className="text-earth-800/70 italic leading-relaxed text-lg">&quot;Code that grows like vines. It&apos;s beautiful to watch the protocols adapt to my workflow without friction.&quot;</p>
            </div>
            <div className="glass-module p-8 md:p-10 hover:shadow-2xl transition-all hover:bg-white/60 md:mt-16">
              <div className="flex items-center gap-4 mb-8">
                <img alt="Member" className="w-16 h-16 organic-shape ring-4 ring-bloom/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcOU0z9yQmRqq61I2i_qmOfVvsCK23RUfbiE_ixJ3nuFZ-sYqC5Vtqg2LVIK57ry6bXwWEVvu5LiLzMaclQWt7-P_6EKTWIpKaWHTp8tLrMqWDQTNYNJVk0T1U_2qwhwX7GUgjazFpXn2xlOUiwFLstbbtF-Zpe-Cj_l8Fx9PLefUFtU6Oct8CnQcRQpdB_yiwGIMZlLtFvTm06Hs8n6Mq6Ap2Ocbv6f8FbVw-AjnKSg-zV-ZPNne4uhXFNFSgcu_b6Oc3EfPymfsZ" />
                <div>
                  <h5 className="font-bold text-earth-900">Gaia Rodriguez</h5>
                  <p className="text-xs text-earth-800/40 font-bold uppercase">Eco-Writer</p>
                </div>
              </div>
              <p className="text-earth-800/70 italic leading-relaxed text-lg">&quot;Finally, an interface that values silence as much as data. Maya is a partner in my creative meditation.&quot;</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-7xl mb-8">Join the Grove?</h2>
          <p className="text-earth-800/60 mb-12 text-lg md:text-xl font-medium">Awaiting your frequency to begin the symbiosis.</p>
          <form className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-flora via-mist to-bloom blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 rounded-full"></div>
            <div className="relative flex flex-col sm:flex-row gap-4 glass-module p-3 rounded-[2rem] sm:rounded-full">
              <input className="flex-1 px-8 py-5 bg-transparent border-none focus:ring-0 text-earth-900 text-lg placeholder-earth-800/30" placeholder="your@spiritual.node" type="email" />
              <button className="bg-earth-900 text-white font-bold px-12 py-5 rounded-full hover:bg-flora transition-all text-lg shadow-xl w-full sm:w-auto">
                Sow Intent
              </button>
            </div>
          </form>
          <p className="mt-8 text-sm text-mist font-bold uppercase tracking-[0.3em]">Encrypted Connection Established with Mother Node</p>
        </div>
      </section>
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
                <li><a className="hover:text-flora transition-colors" href="#">Symbiosis</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">Growth Cycles</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">The Grove</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg mb-8 font-display">WISDOM</h4>
              <ul className="space-y-4 text-sm font-medium text-earth-200/60">
                <li><a className="hover:text-flora transition-colors" href="#">Greenpaper</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">Manifesto</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">API_Garden</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg mb-8 font-display">STEWARDSHIP</h4>
              <ul className="space-y-4 text-sm font-medium text-earth-200/60">
                <li><a className="hover:text-flora transition-colors" href="#">Privacy Root</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">Ethics Code</a></li>
                <li><a className="hover:text-flora transition-colors" href="#">Governance</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-earth-200/30 font-bold uppercase tracking-widest">© 2024 MAYA_ECOSYSTEM // FLOW WITH US</p>
            <div className="flex gap-6 text-earth-200/30">
              <span className="material-symbols-outlined hover:text-flora transition-colors cursor-pointer">spa</span>
              <span className="material-symbols-outlined hover:text-flora transition-colors cursor-pointer">language</span>
              <span className="material-symbols-outlined hover:text-flora transition-colors cursor-pointer">psychology</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
