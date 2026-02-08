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

// --- Category අනුව Configuration එක (Colors, Icons, Animations) ---
const categoryConfig: Record<string, { color: string, icon: string, anim: string, glow: string }> = {
  GARBAGE_WASTE: { 
    color: "text-[#0df20d]", 
    icon: "delete_sweep", 
    anim: "animate-bounce", 
    glow: "shadow-[#0df20d]/20" 
  },
  AIR_POLLUTION: { 
    color: "text-purple-400", 
    icon: "factory", 
    anim: "animate-pulse", 
    glow: "shadow-purple-500/20" 
  },
  WATER_POLLUTION: { 
    color: "text-blue-400", 
    icon: "water_drop", 
    anim: "animate-float-water", 
    glow: "shadow-blue-500/20" 
  },
  NOISE_POLLUTION: { 
    color: "text-pink-500", 
    icon: "graphic_eq", 
    anim: "animate-vibrate", 
    glow: "shadow-pink-500/20" 
  },
  POTHOLE_ROAD: { 
    color: "text-amber-500", 
    icon: "construction", 
    anim: "animate-bounce", 
    glow: "shadow-amber-500/20" 
  },
  OTHER: { 
    color: "text-teal-400", 
    icon: "help_center", 
    anim: "animate-spin-slow", 
    glow: "shadow-teal-500/20" 
  }
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-red-500/10 text-red-400 border-red-500/20",
  RESOLVED: "bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/20",
  CLEANED: "bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/20",
  ASSIGNED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-sky-500/10 text-sky-400 border-sky-500/20"
};

export default function IssueCard({ id, description, category, severity, status, createdAt }: IssueCardProps) {
  const config = categoryConfig[category] || categoryConfig.OTHER;
  const created = createdAt instanceof Timestamp ? createdAt.toDate() : createdAt || new Date();

  return (
    <Link
      href={`/issue/${id}`}
      className={`group block relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[#1e293b]/40 backdrop-blur-xl p-6 transition-all duration-500 hover:border-slate-600 hover:shadow-2xl ${config.glow} hover:-translate-y-2`}
    >
      {/* Background Decorative Animation */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full transition-opacity opacity-20 group-hover:opacity-40 ${config.color.replace('text', 'bg')}`}></div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-4 flex-1">
          {/* Status Badge */}
          <span className={`inline-block text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${statusStyles[status] || "bg-slate-800 text-slate-400"}`}>
            {status}
          </span>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
              {category.replace("_", " ")}
            </h3>
            <p className="text-lg font-bold text-white leading-snug line-clamp-2 italic group-hover:text-[#0df20d] transition-colors">
              {description}
            </p>
          </div>
        </div>

        {/* ⭐ Large Animated Icon Section ⭐ */}
        <div className={`flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-900/50 border border-slate-800/50 group-hover:border-[#0df20d]/30 transition-all`}>
           <span className={`material-symbols-outlined text-[45px] ${config.color} ${config.anim}`}>
              {config.icon}
           </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-5 border-t border-slate-800/50 flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Impact Severity</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-4 rounded-full transition-all duration-500 ${
                    i < severity 
                    ? (severity >= 4 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-[#0df20d] shadow-[0_0_8px_#0df20d]') 
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-right">
           <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Logged Date</span>
           <span className="text-[10px] font-bold font-mono text-slate-400 italic">
              {created.toLocaleDateString()}
           </span>
        </div>
      </div>

      {/* Custom Animations CSS */}
      <style jsx>{`
        @keyframes float-water {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes vibrate {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
        .animate-float-water { animation: float-water 3s ease-in-out infinite; }
        .animate-vibrate { animation: vibrate 0.2s linear infinite; }
        .animate-spin-slow { animation: spin 6s linear infinite; }
      `}</style>
    </Link>
  );
}