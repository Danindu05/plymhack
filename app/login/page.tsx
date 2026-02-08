"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); // ⭐ දැනට ඉන්න පරිශීලකයා තබා ගැනීමට
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u); // පරිශීලකයා සිටී නම් set කරනවා
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      const redirect = params.get("redirect") || "/";
      router.replace(redirect);
    } catch (err: any) {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // Sign out වූ පසු ස්වයංක්‍රීයව state එක update වී Login Form එක පෙනෙනු ඇත
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0df20d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ⭐ පරිශීලකයා දැනටමත් ලොග් වී සිටී නම් පෙන්වන කොටස
  if (user) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-[#0df20d]/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#0df20d]/20">
            <span className="material-symbols-outlined text-[#0df20d] text-4xl">account_circle</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Already Signed In</h1>
            <p className="text-slate-400 text-sm">
              You are currently logged in as <br />
              <span className="text-white font-mono">{user.email}</span>
            </p>
          </div>

          <div className="grid gap-3 pt-4">
            <Link href="/" className="w-full">
              <button className="w-full bg-[#0df20d] hover:bg-[#0be00b] text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,13,0.2)]">
                Go to Home
              </button>
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out from this Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ⭐ පරිශීලකයා ලොග් වී නැති විට පෙන්වන Login Form එක
  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Sign In</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your credentials to continue</p>
        </div>

        <form className="space-y-4" onSubmit={login}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-[#0df20d] outline-none transition-all"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-[#0df20d] outline-none transition-all"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0df20d] hover:bg-[#0be00b] py-4 text-black font-bold text-lg shadow-[0_0_20px_rgba(13,242,13,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>

          <p className="text-sm text-slate-400 text-center">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#0df20d] font-bold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}