"use client";

import { ReactNode, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  compact?: boolean;
}

export default function AuthGate({ children, requireAdmin, compact }: Props) {
  const [userState, setUserState] = useState<"loading" | "authed" | "unauth">("loading");
  const [role, setRole] = useState<"admin" | "citizen" | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUserState("unauth");
        setRole(null);
        return;
      }
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        setRole(userDoc.data().role);
      } else {
        await setDoc(doc(db, "users", u.uid), { role: "citizen", email: u.email, displayName: u.displayName || "" });
        setRole("citizen");
      }
      setUserState("authed");
    });
    return () => unsub();
  }, []);

  const handleAuth = async () => {
    try {
      setError("");
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        await setDoc(doc(db, "users", cred.user.uid), { role: "citizen", email, displayName: name });
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (userState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-4 border-[#0df20d] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse text-sm font-bold tracking-widest uppercase">Securing Session...</p>
      </div>
    );
  }

  if (userState === "unauth") {
    return (
      <div className={`w-full ${compact ? 'max-w-md mx-auto' : 'min-h-screen flex items-center justify-center p-4'}`}>
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Join the Community</h2>
            <p className="text-slate-400 text-xs mt-1">Please sign in to report issues and track cleanup.</p>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === "login" ? "bg-[#0df20d] text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
              onClick={() => setMode("login")}
            >Login</button>
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === "signup" ? "bg-[#0df20d] text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
              onClick={() => setMode("signup")}
            >Sign Up</button>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} 
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0df20d] outline-none" />
            )}
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0df20d] outline-none" />
            <input placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} 
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0df20d] outline-none" />
          </div>

          {error && <p className="text-red-400 text-[10px] text-center">{error}</p>}
          <button className="w-full bg-[#0df20d] hover:bg-[#0be00b] text-black font-bold py-3 rounded-xl transition-all" onClick={handleAuth}>
            {mode === "login" ? "Continue" : "Create Account"}
          </button>
        </div>
      </div>
    );
  }

  if (requireAdmin && role !== "admin") {
    return (
      <div className="max-w-md mx-auto bg-[#1e293b] p-8 rounded-2xl border border-red-500/30 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Admin Access Required</h3>
        <p className="text-slate-400 text-sm">Please switch to an admin account to proceed.</p>
        <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2 flex justify-between items-center text-[10px] text-slate-400">
          <span>Signed in as <span className="text-white font-mono">{auth.currentUser?.email}</span></span>
          <button className="text-red-400 hover:underline" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      )}
      {children}
    </div>
  );
}