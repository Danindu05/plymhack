"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ⭐ Setting SSR to False completely resolves the "window is not defined" error
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
   ssr: false,
   loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
         <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#0df20d]/20 border-t-[#0df20d] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Initializing Map Engine...</p>
         </div>
      </div>
   )
});

export default function MapPage() {
   return (
      <main className="h-[calc(100vh-64px)] w-full relative">
         {/* Suspense is required to handle Search Params */}
         <Suspense fallback={<div>Loading Search...</div>}>
            <MapComponent />
         </Suspense>

         {/* Optional: Legend Overlay */}
         <div className="absolute bottom-8 left-8 z-[500] bg-[#1e293b]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 hidden md:block">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0df20d] shadow-[0_0_8px_#0df20d]"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Standard</span>
               </div>
            </div>
         </div>
      </main>
   );
}