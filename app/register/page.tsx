"use client";

import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const redirect = params.get("redirect") || "/";
        router.replace(redirect);
      }
    });
    return () => unsub();
  }, [router, params]);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      if (name) await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: name,
        email,
        role: "citizen"
      }, { merge: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
        <form className="space-y-4" onSubmit={register}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Display name</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-green px-4 py-2 text-black font-semibold disabled:opacity-60"
          >
            {loading ? <LoadingSpinner label="Creating..." /> : "Register"}
          </button>
          <p className="text-sm text-slate-400 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-green underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
