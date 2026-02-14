"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setRole(snap.data().role);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  // Determine path based on user role (Admin/User)
  const reportLinkPath = role === "admin" ? "/my-issues" : "/report";

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#0df20d] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(13,242,13,0.3)] group-hover:scale-110 transition-transform duration-300">
             <span className="material-symbols-outlined text-black text-xl font-bold">eco</span>
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white uppercase">CLEAN<span className="text-[#0df20d]">PULSE</span></span>
        </Link>

        {/* Dynamic Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/" active={pathname === "/"} label="Home" icon="home" />
          
          <NavLink 
            href={reportLinkPath} 
            active={pathname === reportLinkPath} 
            label="Report" 
            icon="add_circle" 
          />
          
          {/* Show Admin Dashboard only to Admins */}
          {role === "admin" && (
            <NavLink href="/admin" active={pathname === "/admin"} label="Dashboard" icon="dashboard" />
          )}

          <NavLink href="/map" active={pathname === "/map"} label="Live Map" icon="map" />

          {/* ⭐ Logged-in Users/Admins only: New SDG and Pollution features */}
          {user && (
            <>
              <NavLink 
                href="/pollution" 
                active={pathname === "/pollution"} 
                label="Analytics" 
                icon="analytics" 
              />
              <NavLink 
                href="/sustainable-living" 
                active={pathname === "/sustainable-living"} 
                label="SDG 11 Index" 
                icon="home_health" 
              />
            </>
          )}
        </nav>

        {/* User Authentication Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => signOut(auth)} 
                className="bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-[#0df20d] text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(13,242,13,0.2)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// Reusable Navigation Link Component
function NavLink({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
  return (
    <Link 
      href={href} 
      className={`relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:text-[#0df20d] ${
        active ? 'text-[#0df20d]' : 'text-slate-400'
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
      {active && (
        <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-[#0df20d] rounded-full shadow-[0_0_8px_#0df20d]"></span>
      )}
    </Link>
  );
}