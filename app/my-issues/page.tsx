"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

import AuthGuard from "@/components/AuthGuard";
import IssueCard from "@/components/IssueCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { auth, db } from "@/lib/firebase";

type IssueDoc = {
  id: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  createdAt?: Timestamp;
};

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubIssues: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // 🔥 CRITICAL FIX: Query එක වෙනස් කළා IssueForm එකට ගැලපෙන්න
      // "createdBy.uid" වෙනුවට "createdBy" පමණක් භාවිතා කරන්න
      const q = query(
        collection(db, "issues"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubIssues = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any)
          }));
          setIssues(list);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      unsubIssues?.();
    };
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">My Reports</h1>
              <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">
                Track and manage your civic submissions
              </p>
            </div>
            <Link href="/report">
              <button className="flex items-center gap-2 bg-[#0df20d] hover:bg-[#0be00b] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(13,242,13,0.3)] hover:scale-105">
                <span className="material-symbols-outlined">add_circle</span>
                New Report
              </button>
            </Link>
          </div>

          {/* Error Message with Index Help */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in">
              <span className="material-symbols-outlined text-xl">error</span>
              <div>
                <p className="font-bold">System Query Error</p>
                <p className="opacity-80">{error}</p>
                <p className="mt-2 text-[10px] uppercase font-bold tracking-widest opacity-60">
                  Note: If you see index error, check Firebase Console to create 'createdBy' ASC + 'createdAt' DESC index.
                </p>
              </div>
            </div>
          )}

          {/* List Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#0df20d] border-t-transparent mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <p className="text-slate-400 font-medium">You haven&apos;t submitted any issues yet.</p>
              <Link href="/report" className="inline-block text-[#0df20d] text-sm font-bold uppercase tracking-widest hover:underline">
                Submit your first report now →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {issues.map((i) => (
                <div key={i.id} className="transition-all hover:scale-[1.02]">
                   <IssueCard
                    id={i.id}
                    description={i.description}
                    category={i.category}
                    severity={i.severity}
                    status={i.status}
                    createdAt={i.createdAt}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}