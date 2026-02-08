"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <header className="w-full bg-slate-900/70 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold text-brand-green">
          CleanPulse
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:text-brand-green" href="/">Home</Link>
          <Link className="hover:text-brand-green" href="/report">Report Issue</Link>
          <Link className="hover:text-brand-green" href="/my-issues">My Issues</Link>
          <Link className="hover:text-brand-green" href="/profile">Profile</Link>
        </nav>
        <div className="flex items-center gap-3 text-xs md:text-sm">
          {user ? (
            <>
              <span className="text-slate-300 truncate max-w-[160px]">{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="rounded bg-brand-green text-black px-3 py-1 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded bg-brand-green text-black px-3 py-1 font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
