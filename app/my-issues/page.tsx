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
  const [showIntro, setShowIntro] = useState(true); // ⭐ Intro animation state
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubIssues: (() => void) | undefined;

    // Timer for the book animation (e.g., 2.5 seconds)
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    const unsubAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Query optimized for the updated IssueForm data structure
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
      clearTimeout(timer);
    };
  }, []);

  /* -------------------------------------------------- */
  /* UI: BOOK OPENING ANIMATION SCREEN */
  /* -------------------------------------------------- */
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden">
        <div className="relative perspective-1000">
           {/* Large Book Icon with Opening Animation */}
           <div className="book-wrapper animate-book-open">
              <span className="material-symbols-outlined text-[150px] text-[#0df20d] drop-shadow-[0_0_30px_rgba(13,242,13,0.3)]">
                menu_book
              </span>
           </div>
           
           {/* Decorative Glow */}
           <div className="absolute inset-0 bg-[#0df20d]/20 blur-[100px] rounded-full animate-pulse"></div>
        </div>

        <div className="mt-10 text-center">
           <h2 className="text-[#0df20d] font-black italic uppercase tracking-[0.3em] text-xl animate-pulse">
             Accessing Records
           </h2>
           <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-widest">
             Deciphering secure database...
           </p>
        </div>

        <style jsx>{`
          .perspective-1000 { perspective: 1000px; }
          @keyframes book-open {
            0% { transform: rotateY(0deg) scale(0.8); opacity: 0.5; }
            50% { transform: rotateY(-20deg) scale(1.1); opacity: 1; }
            100% { transform: rotateY(-45deg) scale(1.2); opacity: 0; }
          }
          .animate-book-open {
            animation: book-open 2.5s ease-in-out forwards;
            transform-origin: left;
          }
        `}</style>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* UI: MAIN CONTENT (GLASSMORPHISM THEME) */
  /* -------------------------------------------------- */
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8 animate-in fade-in zoom-in duration-700">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Header with Visual Impact */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0df20d]/5 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <span className="w-10 h-[2px] bg-[#0df20d]"></span>
                 <span className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.4em]">Personal Archive</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                My <span className="text-slate-700">Reports</span>
              </h1>
            </div>

            <Link href="/report" className="relative z-10">
              <button className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-[#0df20d] hover:shadow-[0_0_30px_rgba(13,242,13,0.4)] hover:-translate-y-1">
                <span className="material-symbols-outlined font-bold group-hover:rotate-90 transition-transform">add</span>
                New Incident
              </button>
            </Link>
          </div>

          {/* Error handling */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 text-red-400">
              <span className="material-symbols-outlined text-3xl">database_off</span>
              <div className="text-xs font-bold uppercase tracking-widest">Query Failure: {error}</div>
            </div>
          )}

          {/* Issues List or Empty State */}
          <div className="relative z-10">
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-900/40 border border-slate-800 rounded-[40px] border-dashed">
                <span className="material-symbols-outlined text-7xl text-slate-800 mb-6">folder_open</span>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No historical records found</p>
                <Link href="/report" className="mt-4 text-[#0df20d] text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                  Begin your first report
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {issues.map((i, index) => (
                  <div 
                    key={i.id} 
                    className="animate-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
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
      </div>
    </AuthGuard>
  );
}