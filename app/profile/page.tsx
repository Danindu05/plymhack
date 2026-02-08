"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { auth, db } from "@/lib/firebase";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || "");
        setUid(user.uid);
        setDisplayName(user.displayName || "");
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.displayName) setDisplayName(data.displayName);
        }
      }
    });
    return () => unsub();
  }, []);

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { displayName, email: auth.currentUser.email },
        { merge: true }
      );
      setMessage("Profile saved.");
    } catch (e: any) {
      setMessage(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-semibold">{email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">UID</p>
              <p className="font-mono text-xs break-all">{uid}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Display name</label>
              <input
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded bg-brand-green px-4 py-2 text-black font-semibold disabled:opacity-60"
            >
              {saving ? <LoadingSpinner label="Saving..." /> : "Save"}
            </button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
            <p className="text-sm text-slate-300">Avatar (local preview only)</p>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-xs">No avatar</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAvatarUrl(URL.createObjectURL(file));
                }}
              />
            </div>
            <button
              onClick={() => signOut(auth)}
              className="rounded border border-red-400 text-red-300 px-4 py-2 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
