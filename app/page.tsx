'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll Effect for Navbar transparency
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#0f172a] text-white font-sans min-h-screen flex flex-col overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0df20d] flex items-center justify-center shadow-[0_0_15px_rgba(13,242,13,0.4)]">
              {/* Material Icon */}
              <span className="material-symbols-outlined text-black text-xl font-bold">recycling</span>
            </div>
            <span className="text-xl font-bold tracking-tight">CleanPulse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <Link href="/report" className="text-sm font-medium text-slate-300 hover:text-[#0df20d] transition-colors">Report Issue</Link>
             <Link href="/map" className="text-sm font-medium text-slate-300 hover:text-[#0df20d] transition-colors">Live Map</Link>
             <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-[#0df20d] transition-colors">Dashboard</Link>
          </div>

          {/* LINK CHANGED: Sign In -> Dashboard (/admin) */}
          <Link href="/admin">
            <button className="px-5 py-2 rounded-full border border-[#0df20d]/50 text-[#0df20d] text-sm font-bold hover:bg-[#0df20d] hover:text-black transition-all">
Go to Dashboard            </button>
          </Link>
        </div>
      </nav>

      {/* --- 1. HERO SECTION (VIDEO) --- */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay for Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0df20d]/10 border border-[#0df20d]/20 text-[#0df20d] text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#0df20d]"></span>
              Smart City Initiative
           </div>
           
           <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-2xl">
              Transforming Urban Waste <br/>
              Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df20d] to-emerald-400">Sustainable Energy</span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
              Join the revolution. Report waste, track cleanup crews, and watch your city become cleaner and greener with AI-powered logistics.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                 <button className="px-8 py-4 rounded-xl bg-[#0df20d] text-black font-bold text-lg hover:bg-[#0be00b] hover:scale-105 transition-all shadow-[0_0_30px_rgba(13,242,13,0.3)] flex items-center gap-2">
                    <span className="material-symbols-outlined">camera_alt</span>
                    Report Issue Now
                 </button>
              </Link>
              
              {/* LINK CHANGED: View Live Map -> /map */}
              <Link href="/map">
                 <button className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">public</span>
                    View Live Map
                 </button>
              </Link>
           </div>
        </div>
      </div>

      {/* --- 2. ABOUT & VISION --- */}
      <section className="py-24 bg-[#0f172a] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-16 items-center">
              
              <div>
                 <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                    Building the Future of <br/> <span className="text-[#0df20d]">Civic Engagement</span>
                 </h2>
                 <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                    CleanPulse connects citizens directly with city services using advanced AI. 
                    We turn every smartphone into a tool for environmental protection.
                 </p>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-[#1e293b] rounded-xl border border-slate-700">
                       <h4 className="text-[#0df20d] font-bold text-3xl mb-1">98%</h4>
                       <p className="text-sm text-slate-400">Detection Accuracy</p>
                    </div>
                    <div className="p-4 bg-[#1e293b] rounded-xl border border-slate-700">
                       <h4 className="text-[#0df20d] font-bold text-3xl mb-1">2hr</h4>
                       <p className="text-sm text-slate-400">Avg Response Time</p>
                    </div>
                 </div>
              </div>

              {/* Video Box */}
              <div className="relative h-[450px] rounded-3xl overflow-hidden border border-slate-700 shadow-[0_0_40px_rgba(13,242,13,0.15)] group">
                 <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700">
                   <source src="/hero.mp4" type="video/mp4" />
                 </video>
                 <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                       <span className="material-symbols-outlined text-4xl text-[#0df20d] ml-1">play_arrow</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Our Vision</h3>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* --- 3. FEATURES --- */}
      <section className="py-24 bg-[#0b1120] relative z-10 border-y border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <span className="text-[#0df20d] font-bold text-sm tracking-widest uppercase">Key Features</span>
               <h2 className="text-3xl font-bold mt-2 text-white">How Technology Drives Change</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: 'center_focus_strong', title: 'AI Detection', desc: 'Instantly analyze waste types and road damage using computer vision.' },
                 { icon: 'share_location', title: 'GPS Tracking', desc: 'Pinpoint exact locations for rapid response teams, reducing delays.' },
                 { icon: 'bar_chart', title: 'Impact Analytics', desc: 'Monitor city cleanliness scores and environmental impact in real-time.' }
               ].map((feature, idx) => (
                  <div key={idx} className="p-8 rounded-2xl bg-[#1e293b]/50 border border-slate-800 hover:border-[#0df20d]/50 transition-all group backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-xl bg-[#0df20d]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <span className="material-symbols-outlined text-[#0df20d] text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- 4. NEW: LIVE COVERAGE MAP SECTION --- */}
      <section className="py-24 bg-[#0f172a] relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Live Coverage Map</h2>
                  <p className="text-slate-400 max-w-xl">
                    See real-time reports coming in from citizens across the city. 
                    Our AI verifies and assigns each issue instantly.
                  </p>
               </div>
               <Link href="/map">
                  <button className="px-6 py-3 rounded-lg bg-[#1e293b] hover:bg-[#283546] text-white font-medium border border-slate-700 flex items-center gap-2 transition-all group">
                     Explore Full Map 
                     <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
               </Link>
            </div>

            {/* Simulated Live Map Visualization */}
            <div className="relative w-full h-[500px] bg-[#0b1120] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group cursor-pointer">
               
               {/* Dark Map Background Pattern */}
               <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>

               {/* Simulated Pulsing Markers (Fake Data) */}
               {/* Marker 1 */}
               <div className="absolute top-[30%] left-[20%]">
                  <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#0df20d] opacity-20 animate-ping duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0df20d] shadow-[0_0_15px_rgba(13,242,13,1)]"></span>
               </div>
               
               {/* Marker 2 */}
               <div className="absolute top-[60%] right-[30%]">
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-orange-500 opacity-20 animate-ping delay-700"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)]"></span>
               </div>

               {/* Marker 3 */}
               <div className="absolute bottom-[40%] left-[45%]">
                  <span className="absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-20 animate-ping delay-300"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"></span>
               </div>

               {/* Floating Info Card */}
               <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl max-w-xs w-full transform transition-all hover:scale-105">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                     <div className="w-10 h-10 rounded-full bg-[#0df20d]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0df20d]">public</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-white text-sm">System Status</h4>
                        <p className="text-[10px] text-[#0df20d] font-bold uppercase tracking-wider flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 bg-[#0df20d] rounded-full animate-pulse"></span> Online
                        </p>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Active Reports</span>
                        <span className="text-white font-mono font-bold">1,240</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Resolved (24h)</span>
                        <span className="text-[#0df20d] font-mono font-bold">850</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0b1120] border-t border-slate-800 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-[#0df20d]">recycling</span>
                     <span className="text-xl font-bold">CleanPulse</span>
                  </div>
                  <p className="text-sm text-slate-500">Empowering citizens to build smarter, cleaner, and more sustainable cities through technology.</p>
               </div>
               {['Product', 'Company', 'Legal'].map((title) => (
                 <div key={title}>
                    <h4 className="font-bold mb-4 text-white">{title}</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                       <li><Link href="#" className="hover:text-[#0df20d]">Link 1</Link></li>
                       <li><Link href="#" className="hover:text-[#0df20d]">Link 2</Link></li>
                    </ul>
                 </div>
               ))}
            </div>
            <div className="text-center text-slate-600 text-sm border-t border-slate-800 pt-8">
               <p>&copy; 2026 CleanPulse. All rights reserved.</p>
            </div>
         </div>
      </footer>
    </div>
  );
}