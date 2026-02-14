"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { calcPriorityScore, Category, Status } from "@/lib/util";

type Issue = {
  id: string;
  category: Category;
  status: Status;
  severity: number;
  description: string;
  aiSummary?: string;
  aiRecommendedAction?: string;
  createdAt?: any;
  counts: { stillThere: number; cleaned: number };
  createdBy?: any;
  priorityScore: number;
  location: { lat: number; lng: number };
  timeline: any[];
};

const statusOrder: Status[] = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export default function AdminTable() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<Category | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* -------------------------------------------------- */
  /* REALTIME LISTENER (SAFE QUERY) */
  /* -------------------------------------------------- */
  useEffect(() => {
    // ⭐ Removed orderBy and used a simple Query to avoid Index error for now
    const q = query(collection(db, "issues"));

    const unsub = onSnapshot(q, (snap) => {
      const list: Issue[] = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as any)
        }))
        .filter((item) => item.id && item.description); // Junk data filter

      // ⭐ Sorting by Priority Score within the code after receiving data
      const sortedList = list.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

      setIssues(sortedList);
    }, (err) => {
      console.error("Firestore Listener Error:", err);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      const statusOk = statusFilter === "ALL" || i.status === statusFilter;
      const catOk = categoryFilter === "ALL" || i.category === categoryFilter;
      return statusOk && catOk;
    });
  }, [issues, statusFilter, categoryFilter]);

  const nextStatus = (s: Status) =>
    statusOrder[Math.min(statusOrder.indexOf(s) + 1, statusOrder.length - 1)];

  /* -------------------------------------------------- */
  /* ADMIN ACTIONS */
  /* -------------------------------------------------- */
  const updateStatus = async (issue: Issue, status: Status) => {
    if (!auth.currentUser || !issue.id) return alert("Invalid operation.");

    try {
      const ref = doc(db, "issues", issue.id);
      const priorityScore = calcPriorityScore({
        category: issue.category,
        severity: issue.severity,
        counts: issue.counts,
        createdAt: issue.createdAt,
        status
      });

      const timeline = [
        ...(issue.timeline || []),
        {
          at: new Date(),
          by: auth.currentUser.uid,
          status,
          note: `Status updated to ${status} by admin.`
        }
      ];

      await updateDoc(ref, { status, timeline, priorityScore });
    } catch (err: any) {
      alert("Update Error: " + err.message);
    }
  };

  const runGeminiAction = async (issue: Issue) => {
    if (!issue.id) return;
    setActionLoading(issue.id);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: issue.description,
          category: issue.category,
          severity: issue.severity,
          kind: "action"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error || "AI Error");

      await updateDoc(doc(db, "issues", issue.id), { aiRecommendedAction: data.text });

    } catch (e: any) {
      alert("AI Processing Failed: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Incidents</h4>
          <p className="text-5xl font-black text-white mt-2">{issues.length}</p>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Urgent Tasks</h4>
          <p className="text-5xl font-black text-red-500 mt-2">{issues.filter(i => (i.priorityScore || 0) > 70).length}</p>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">System Status</p>
            <div className="flex items-center gap-2 text-[#0df20d]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df20d] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0df20d]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">Database Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 items-center justify-between">
        <div className="flex gap-3">
          <select className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-700 outline-none focus:border-[#0df20d]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{filtered.length} Results Tracked</span>
      </div>

      {/* Table Container */}
      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50">
            <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
              <th className="p-8">Description & AI Analysis</th>
              <th className="p-8">Priority</th>
              <th className="p-8">Current State</th>
              <th className="p-8 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest">No issues found in the system.</td>
              </tr>
            ) : (
              filtered.map((i) => (
                <tr key={i.id} className="group hover:bg-slate-800/20 transition-all cursor-pointer" onClick={() => router.push(`/issue/${i.id}`)}>
                  <td className="p-8 max-w-sm">
                    <p className="text-white font-bold text-sm italic group-hover:text-[#0df20d] transition-colors line-clamp-1">"{i.description}"</p>
                    {i.aiRecommendedAction && (
                      <div className="mt-2 text-[#0df20d] text-[10px] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                        {i.aiRecommendedAction}
                      </div>
                    )}
                  </td>
                  <td className="p-8">
                    <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${(i.priorityScore || 0) > 70 ? 'bg-red-500' : 'bg-[#0df20d]'}`} style={{ width: `${i.priorityScore || 0}%` }}></div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${i.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      i.status === 'RESOLVED' ? 'bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="p-8 text-right space-x-2">
                    <button
                      disabled={actionLoading === i.id}
                      onClick={(e) => { e.stopPropagation(); runGeminiAction(i); }}
                      className="p-3 bg-slate-950 text-[#0df20d] rounded-2xl border border-slate-800 hover:border-[#0df20d]/50 transition-all"
                    >
                      <span className={`material-symbols-outlined text-sm ${actionLoading === i.id ? 'animate-spin' : ''}`}>
                        {actionLoading === i.id ? 'sync' : 'bolt'}
                      </span>
                    </button>
                    {i.status !== 'RESOLVED' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(i, nextStatus(i.status)); }}
                        className="bg-white text-black px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0df20d] transition-all"
                      >
                        {nextStatus(i.status)}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}