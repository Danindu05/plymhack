"use client";

import Link from "next/link";
import { Timestamp } from "firebase/firestore";

type IssueCardProps = {
  id: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  createdAt?: Date | Timestamp;
};

// --- Custom SVG Animation Components for each Category ---

const GarbageAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <span className="material-symbols-outlined text-6xl text-[#0df20d] animate-bounce-slow">delete_sweep</span>
    <div className="absolute -bottom-1 w-10 h-1 bg-black/20 blur-md rounded-full animate-shadow-pulse"></div>
  </div>
);

const AirAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <span className="material-symbols-outlined text-6xl text-purple-400 animate-pulse">factory</span>
    {/* Smoke particles rising */}
    <div className="absolute top-0 right-2 w-2 h-2 bg-slate-400 rounded-full animate-smoke-1 opacity-0"></div>
    <div className="absolute top-1 right-4 w-3 h-3 bg-slate-500 rounded-full animate-smoke-2 opacity-0"></div>
  </div>
);

const WaterAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <span className="material-symbols-outlined text-6xl text-blue-400 animate-float-water">water_drop</span>
    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple"></div>
  </div>
);

const NoiseAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center gap-1">
    <div className="w-1.5 h-6 bg-pink-500 rounded-full animate-music-bar-1"></div>
    <div className="w-1.5 h-10 bg-pink-400 rounded-full animate-music-bar-2"></div>
    <div className="w-1.5 h-8 bg-pink-500 rounded-full animate-music-bar-3"></div>
  </div>
);

const PotholeAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <span className="material-symbols-outlined text-6xl text-amber-500 animate-vibrate">construction</span>
  </div>
);

const DefaultAnimation = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <span className="material-symbols-outlined text-6xl text-teal-400 animate-spin-slow">help_center</span>
  </div>
);

export default function IssueCard({ id, description, category, severity, status, createdAt }: IssueCardProps) {
  const created = createdAt instanceof Timestamp ? createdAt.toDate() : createdAt || new Date();

  // Pick the right animation based on category
  const renderAnimation = () => {
    switch (category) {
      case "GARBAGE_WASTE": return <GarbageAnimation />;
      case "AIR_POLLUTION": return <AirAnimation />;
      case "WATER_POLLUTION": return <WaterAnimation />;
      case "NOISE_POLLUTION": return <NoiseAnimation />;
      case "POTHOLE_ROAD": return <PotholeAnimation />;
      default: return <DefaultAnimation />;
    }
  };

  const statusStyles: Record<string, string> = {
    OPEN: "bg-red-500/10 text-red-400 border-red-500/20",
    RESOLVED: "bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/20",
    CLEANED: "bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/20",
  };

  return (
    <Link
      href={`/issue/${id}`}
      className="group block relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-[#1e293b]/30 backdrop-blur-2xl p-8 transition-all duration-500 hover:border-slate-600 hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:-translate-y-2"
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-20 -right-20 w-48 h-48 blur-[80px] rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-700
        ${category === 'GARBAGE_WASTE' ? 'bg-[#0df20d]' : 
          category === 'AIR_POLLUTION' ? 'bg-purple-500' : 
          category === 'WATER_POLLUTION' ? 'bg-blue-500' : 'bg-teal-500'}`}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        
        {/* --- Left Content --- */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${statusStyles[status] || "bg-slate-800 text-slate-400"}`}>
               {status}
             </span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-1.5">
               {category.replace("_", " ")}
             </span>
          </div>

          <p className="text-xl md:text-2xl font-bold text-white italic tracking-tight leading-tight group-hover:text-[#0df20d] transition-colors line-clamp-2">
            "{description}"
          </p>
        </div>

        {/* --- Right Animated Icon (LOCKED LARGE SIZE) --- */}
        <div className="flex-shrink-0 bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800 group-hover:border-[#0df20d]/40 transition-all duration-500">
           {renderAnimation()}
        </div>
      </div>

      {/* --- Footer Details --- */}
      <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Impact Severity</span>
           <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-2 w-5 rounded-full transition-all duration-500 ${i < severity ? (severity >= 4 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#0df20d] shadow-[0_0_10px_#0df20d]') : 'bg-slate-800'}`} />
              ))}
           </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs italic">
           <span className="material-symbols-outlined text-sm">calendar_month</span>
           {created.toLocaleDateString()}
        </div>
      </div>

      {/* --- Advanced Custom Keyframes --- */}
      <style jsx>{`
        @keyframes float-water {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes shadow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.4; }
        }
        @keyframes smoke-1 {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes music-bar {
          0%, 100% { height: 10px; }
          50% { height: 35px; }
        }
        @keyframes vibrate {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-shadow-pulse { animation: shadow-pulse 3s infinite; }
        .animate-smoke-1 { animation: smoke-1 2s infinite; }
        .animate-smoke-2 { animation: smoke-1 2.5s infinite 0.5s; }
        .animate-float-water { animation: float-water 3s ease-in-out infinite; }
        .animate-ripple { animation: ripple 2s linear infinite; }
        .animate-music-bar-1 { animation: music-bar 0.8s infinite ease-in-out; }
        .animate-music-bar-2 { animation: music-bar 0.5s infinite ease-in-out; }
        .animate-music-bar-3 { animation: music-bar 1s infinite ease-in-out; }
        .animate-vibrate { animation: vibrate 0.1s infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </Link>
  );
}