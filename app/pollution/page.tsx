"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ⭐ Loading Pollution Map with SSR disabled to prevent 'window' error
const PollutionMap = dynamic(() => import("@/components/PollutionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0df20d]/20 border-t-[#0df20d] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Establishing Satellite Connection...</p>
       </div>
    </div>
  )
});

export default function PollutionPage() {
  return (
    <main className="h-[calc(100vh-64px)] w-full relative">
      <Suspense fallback={<div className="text-white p-20">Initializing...</div>}>
         <PollutionMap />
      </Suspense>

      {/* Title Badge */}
      <div className="absolute top-10 left-10 z-[500] pointer-events-none hidden md:block">
         <div className="bg-slate-900/80 backdrop-blur-xl px-8 py-5 rounded-[2.5rem] border border-slate-700 shadow-2xl">
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
              Pollution <span className="text-[#0df20d]">Observatory</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Planetary Air Quality Intelligence</p>
         </div>
      </div>
    </main>
  );
}