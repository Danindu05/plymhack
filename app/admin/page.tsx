"use client";

import { useState } from "react";
import AdminTable from "@/components/AdminTable";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AuthGate requireAdmin>
      <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-64 bg-[#1e293b] border-r border-slate-700 hidden md:flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-[#0df20d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-black font-bold">recycling</span>
               </div>
               <span className="text-xl font-bold tracking-tight">CleanPulse</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-1">Admin Console v2.0</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#0df20d]/10 text-[#0df20d] font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </button>
            <Link href="/report" className="w-full">
  <button 
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white"
  >
    <span className="material-symbols-outlined">post_add</span>
    Submit New Issue
  </button>
</Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <span className="material-symbols-outlined">group</span>
              Users
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <span className="material-symbols-outlined">analytics</span>
              Analytics
            </button>
          </nav>

          <div className="p-4 border-t border-slate-700">
            <Link href="/">
               <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all">
                 <span className="material-symbols-outlined text-sm">logout</span>
                 Exit Dashboard
               </button>
            </Link>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-700 p-6 flex justify-between items-center sticky top-0 z-20">
             <h1 className="text-2xl font-bold text-white">
               {activeTab === 'overview' ? 'City Overview' : 'Manage Issues'}
             </h1>
             <div className="flex items-center gap-4">
                <div className="relative">
                   <span className="material-symbols-outlined text-slate-400">notifications</span>
                   <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold">AD</div>
             </div>
          </header>

          <div className="p-6">
             <AdminTable />
          </div>
        </main>
      </div>
    </AuthGate>
  );
}