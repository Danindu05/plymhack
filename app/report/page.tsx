"use client";

import IssueForm from "@/components/IssueForm";
import AuthGate from "@/components/AuthGate";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center py-20 px-4">
      
      {/* Background Animated Decor */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#0df20d]/5 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-block p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4 animate-bounce">
             <span className="material-symbols-outlined text-red-500 text-4xl">emergency_home</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            Citizen <span className="text-[#0df20d]">Reporting Portal</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Report environmental hazards, waste, or infrastructure issues. 
            Your report is AI-analyzed and routed to the response team.
          </p>
        </div>
        
        <AuthGate compact>
          <IssueForm />
        </AuthGate>
      </div>
    </div>
  );
}