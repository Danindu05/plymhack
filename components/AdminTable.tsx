"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // 1. Router import කළා
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
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
  const router = useRouter(); // 2. Router initialize කළා
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<Category | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* -------------------------------------------------- */
  /* REALTIME LISTENER */
  /* -------------------------------------------------- */
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("priorityScore", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Issue[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      }));
      setIssues(list);
    });
    return () => unsub();
  }, []);

  /* -------------------------------------------------- */
  /* FILTERS & LOGIC */
  /* -------------------------------------------------- */
  const filtered = useMemo(() => {
    return issues.filter((i) => {
      const statusOk = statusFilter === "ALL" || i.status === statusFilter;
      const catOk = categoryFilter === "ALL" || i.category === categoryFilter;
      return statusOk && catOk;
    });
  }, [issues, statusFilter, categoryFilter]);

  const nextStatus = (s: Status) =>
    statusOrder[Math.min(statusOrder.indexOf(s) + 1, statusOrder.length - 1)];

  const updateStatus = async (issue: Issue, status: Status) => {
    if (!auth.currentUser) return;
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
        note: "Updated via admin"
      }
    ];

    await updateDoc(ref, { status, timeline, priorityScore });
  };

  const runGeminiAction = async (issue: Issue) => {
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
      const { text } = await res.json();
      await updateDoc(doc(db, "issues", issue.id), { aiRecommendedAction: text });
    } finally {
      setActionLoading(null);
    }
  };

  const createDemoData = async () => {
    if (!auth.currentUser) return;
    const seed: any[] = [
      {
        category: "GARBAGE_WASTE",
        status: "OPEN",
        severity: 4,
        description: "Overflowing trash bins beside the market emitting foul smell.",
        counts: { stillThere: 2, cleaned: 0 },
        location: { lat: 14.5995, lng: 120.9842 },
      },
      {
        category: "POTHOLE_ROAD",
        status: "ASSIGNED",
        severity: 3,
        description: "Deep pothole on main avenue causing cars to swerve.",
        counts: { stillThere: 1, cleaned: 0 },
        location: { lat: 14.6042, lng: 120.9823 },
      }
    ];

    for (const s of seed) {
      await addDoc(collection(db, "issues"), {
        ...s,
        aiSummary: s.description,
        aiRecommendedAction: "",
        createdAt: serverTimestamp(),
        createdBy: { uid: auth.currentUser.uid },
        priorityScore: calcPriorityScore({
          category: s.category,
          severity: s.severity,
          counts: s.counts,
          createdAt: new Date(),
          status: s.status
        }),
        timeline: [{ at: new Date(), by: auth.currentUser.uid, status: s.status, note: "Demo seed" }]
      });
    }
  };

  /* -------------------------------------------------- */
  /* UI RENDER */
  /* -------------------------------------------------- */
  return (
    <div className="space-y-6">
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 shadow-lg">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Issues</h4>
            <p className="text-3xl font-bold text-white mt-1">{issues.length}</p>
         </div>
         <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 shadow-lg">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">High Priority</h4>
            <p className="text-3xl font-bold text-red-500 mt-1">{issues.filter(i => i.priorityScore > 50).length}</p>
         </div>
         <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 shadow-lg">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resolved Today</h4>
            <p className="text-3xl font-bold text-[#0df20d] mt-1">{issues.filter(i => i.status === 'RESOLVED').length}</p>
         </div>
         <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center">
             <button 
               onClick={createDemoData} 
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-all border border-slate-600 active:scale-95"
             >
               <span className="material-symbols-outlined text-sm">database</span>
               Generate Demo Data
             </button>
         </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-[#1e293b] p-4 rounded-xl border border-slate-700 items-center justify-between">
         <div className="flex gap-4">
            <select 
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0df20d]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            {/* ... other selects ... */}
         </div>
         <span className="text-slate-400 text-sm">{filtered.length} Records Found</span>
      </div>

      {/* Issues Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Category / Priority</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">AI Actions</th>
              <th className="p-4 font-semibold text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map((i) => (
              <tr 
                key={i.id} 
                className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                onClick={() => router.push(`/issue/${i.id}`)} // 3. මෙන්න Navigation එක දැම්මා
              >
                
                {/* Description Column */}
                <td className="p-4 max-w-xs">
                  <div className="font-medium text-white truncate" title={i.description}>
                    {i.description}
                  </div>
                  {i.aiRecommendedAction && (
                    <div className="mt-1 text-xs text-[#0df20d] bg-[#0df20d]/10 px-2 py-1 rounded inline-block">
                      💡 AI: {i.aiRecommendedAction.slice(0, 40)}...
                    </div>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded w-fit">
                       {i.category.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-mono ${i.priorityScore > 50 ? 'text-red-400' : 'text-slate-500'}`}>
                       Score: {i.priorityScore.toFixed(0)}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      i.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      i.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                   }`}>
                      {i.status}
                   </span>
                </td>

                <td className="p-4">
                  <button
                    className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                       actionLoading === i.id 
                       ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-wait' 
                       : 'bg-[#0df20d]/10 text-[#0df20d] border-[#0df20d]/30 hover:bg-[#0df20d]/20'
                    }`}
                    onClick={(e) => {
                        e.stopPropagation(); // 4. Button එක එබුවම Row click නොවෙන්න හැදුවා
                        runGeminiAction(i);
                    }}
                    disabled={actionLoading === i.id}
                  >
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    {actionLoading === i.id ? "Analyzing..." : "Generate Plan"}
                  </button>
                </td>

                <td className="p-4 text-right">
                  {i.status !== 'RESOLVED' && (
                    <button
                       className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                       onClick={(e) => {
                           e.stopPropagation(); // 5. Button එක එබුවම Row click නොවෙන්න හැදුවා
                           updateStatus(i, nextStatus(i.status));
                       }}
                    >
                       Mark as {nextStatus(i.status)}
                    </button>
                  )}
                  {i.status === 'RESOLVED' && (
                     <span className="text-slate-500 text-xs italic flex items-center justify-end gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Completed
                     </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}