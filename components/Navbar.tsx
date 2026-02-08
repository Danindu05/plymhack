"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#0df20d] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(13,242,13,0.3)] group-hover:scale-110 transition-transform duration-300">
             <span className="material-symbols-outlined text-black text-xl font-bold">eco</span>
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white">
            CLEAN<span className="text-[#0df20d]">PULSE</span>
          </span>
        </Link>

        {/* Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/" active={pathname === "/"} label="Home" icon="home" />
          <NavLink href="/report" active={pathname === "/report"} label="Report" icon="add_circle" />
          <NavLink href="/my-issues" active={pathname === "/my-issues"} label="History" icon="history" />
          <NavLink href="/map" active={pathname === "/map"} label="Live Map" icon="map" />
        </nav>

        {/* User / Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">System Access</p>
                <p className="text-[11px] text-slate-300 font-mono truncate max-w-[140px]">{user.email}</p>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">logout</span>
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-[#0df20d] hover:bg-[#0be00b] text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(13,242,13,0.2)] hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// NavLink Sub-component for better organization
function NavLink({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
  return (
    <Link 
      href={href} 
      className={`relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:text-[#0df20d] group ${
        active ? 'text-[#0df20d]' : 'text-slate-400'
      }`}
    >
      <span className="material-symbols-outlined text-[16px] group-hover:animate-pulse">{icon}</span>
      {label}
      
      {/* Active Indicator Line */}
      {active && (
        <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-[#0df20d] rounded-full shadow-[0_0_8px_#0df20d] animate-in fade-in slide-in-from-left-2 duration-300"></span>
      )}
    </Link>
  );
}