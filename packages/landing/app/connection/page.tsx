import SiteNav from "../components/site-nav";

export default function Connection() {
  return (
    <>
      <SiteNav />
      <header className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="neural-pathway w-[200%] rotate-12 -left-1/4 top-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-8">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl mb-6">Harvesting <span className="text-bloom italic font-script">Wisdom</span></h1>
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

            <div className="mt-24 text-center">
                <h2 className="text-4xl md:text-5xl lg:text-7xl mb-8">Join the Grove?</h2>
                <p className="text-earth-800/60 mb-12 text-lg md:text-xl font-medium">Awaiting your frequency to begin the symbiosis.</p>
                <form className="relative group max-w-2xl mx-auto">
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
