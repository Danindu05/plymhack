"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";

// Types preserved
type TimelineEntry = {
  at: any;
  by: string;
  status: string;
  note: string;
};

type IssueDoc = {
  id: string;
  description: string;
  aiSummary?: string;
  category: string;
  severity: number;
  imageUrl?: string;
  status: string;
  location?: { lat: number; lng: number; geohash?: string };
  counts: { stillThere: number; cleaned: number };
  timeline: TimelineEntry[];
};

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [issue, setIssue] = useState<IssueDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"STILL" | "CLEAN" | null>(null);
  const [message, setMessage] = useState("");

  /* ------------------------------------------------ */
  /* REALTIME LOAD                                   */
  /* ------------------------------------------------ */
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "issues", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setIssue({ id: snap.id, ...(snap.data() as any) });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  /* ------------------------------------------------ */
  /* SORT TIMELINE                                   */
  /* ------------------------------------------------ */
  const timelineSorted = useMemo(() => {
    if (!issue?.timeline) return [];
    return [...issue.timeline].sort((a, b) => {
      const ta = (a.at?.toDate?.() as Date) || new Date(a.at || 0);
      const tb = (b.at?.toDate?.() as Date) || new Date(b.at || 0);
      return tb.getTime() - ta.getTime();
    });
  }, [issue?.timeline]);

  /* ------------------------------------------------ */
  /* STATUS UPDATE LOGIC (PRESERVED)                 */
  /* ------------------------------------------------ */
  const updateStatus = async (type: "STILL_THERE" | "CLEANED") => {
    if (!auth.currentUser || !issue) return;
    setActionLoading(type === "STILL_THERE" ? "STILL" : "CLEAN");
    setMessage("");

    try {
      const ref = doc(db, "issues", issue.id);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Issue not found");
        const data = snap.data() as IssueDoc;

        const counts = { ...(data.counts || { stillThere: 0, cleaned: 0 }) };
        let status = data.status;

        if (type === "STILL_THERE") counts.stillThere += 1;
        if (type === "CLEANED") {
          counts.cleaned += 1;
          status = "RESOLVED"; // Changed to RESOLVED to match system standards
        }

        const timeline: TimelineEntry[] = [
          ...(data.timeline || []),
          {
            at: new Date(),
            by: auth.currentUser!.uid,
            status,
            note: type === "STILL_THERE" ? "Confirmed still present" : "Marked as cleaned"
          }
        ];

        tx.update(ref, { counts, status, timeline });
      });
      setMessage("Status updated successfully.");
    } catch (e: any) {
      setMessage(e.message || "Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0df20d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!issue) return <div className="text-white p-10">Issue not found.</div>;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8 font-sans">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: DETAILS --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Back Button */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </button>

            {/* Main Card */}
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              {/* Image Header */}
              {issue.imageUrl && (
                <div className="relative h-64 w-full bg-slate-900">
                  <img 
                    src={issue.imageUrl} 
                    alt="Issue evidence" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    Evidence
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0df20d]/10 text-[#0df20d] border border-[#0df20d]/20">
                         {issue.category.replace("_", " ")}
                       </span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          issue.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                       }`}>
                         {issue.status}
                       </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {issue.aiSummary || "Issue Report"}
                    </h1>
                  </div>
                  <div className="text-center bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="block text-xs text-slate-400 uppercase">Severity</span>
                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-white">
                      <span className={`material-symbols-outlined ${issue.severity >= 4 ? 'text-red-500' : 'text-yellow-500'}`}>warning</span>
                      {issue.severity}/5
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-lg border-l-4 border-slate-700 pl-4 mb-6">
                  {issue.description}
                </p>

                {/* Verification Actions */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0df20d]">verified_user</span>
                    Community Verification
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => updateStatus("STILL_THERE")}
                        disabled={actionLoading === "STILL"}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-amber-500">thumb_down</span>
                        Still There ({issue.counts?.stillThere || 0})
                      </button>
                      
                      <button
                        onClick={() => updateStatus("CLEANED")}
                        disabled={actionLoading === "CLEAN"}
                        className="flex items-center justify-center gap-2 bg-[#0df20d] hover:bg-[#0be00b] text-black rounded-lg py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(13,242,13,0.2)]"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        Mark Cleaned ({issue.counts?.cleaned || 0})
                      </button>
                  </div>
                  {message && <p className="text-center text-xs text-[#0df20d] mt-3 animate-pulse">{message}</p>}
                </div>
              </div>
            </div>

            {/* AI Analysis Card */}
            {issue.aiSummary && (
              <div className="bg-gradient-to-br from-[#1e293b] to-slate-900 rounded-2xl border border-blue-500/30 p-6 shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-9xl">smart_toy</span>
                 </div>
                 <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    AI Analysis
                 </h3>
                 <p className="text-slate-300 text-sm relative z-10">{issue.aiSummary}</p>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: MAP & TIMELINE --- */}
          <div className="space-y-6">
            
            {/* Location Map Preview */}
            {issue.location && (
              <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-lg group">
                 <div className="h-40 bg-slate-800 relative">
                    {/* Placeholder for Map - In real app use MapView component here */}
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/120.9842,14.5995,14,0/400x200?access_token=YOUR_TOKEN')] bg-cover opacity-50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="material-symbols-outlined text-4xl text-red-500 drop-shadow-lg">location_on</span>
                    </div>
                 </div>
                 <div className="p-4">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                       <span>Lat: {issue.location.lat.toFixed(4)}</span>
                       <span>Lng: {issue.location.lng.toFixed(4)}</span>
                    </div>
                    <Link href={`/map?lat=${issue.location.lat}&lng=${issue.location.lng}&id=${issue.id}`}>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-white transition-all flex items-center justify-center gap-2 group-hover:border-[#0df20d]/50">
                        <span className="material-symbols-outlined text-sm">map</span>
                        View on Live Map
                      </button>
                    </Link>
                 </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 shadow-lg">
               <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">history</span>
                  Activity Log
               </h3>
               
               <div className="relative pl-4 border-l-2 border-slate-700 space-y-6">
                  {timelineSorted.length === 0 && <p className="text-slate-500 text-sm italic">No activity recorded yet.</p>}
                  
                  {timelineSorted.map((t, idx) => {
                    const when = (t.at?.toDate?.() as Date) || new Date(t.at || 0);
                    return (
                      <div key={idx} className="relative">
                         {/* Dot */}
                         <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-[#1e293b] ${
                            t.status === 'RESOLVED' ? 'bg-[#0df20d]' : 'bg-blue-500'
                         }`}></div>
                         
                         <p className="text-sm font-bold text-white">{t.status}</p>
                         <p className="text-xs text-slate-400 mt-0.5">{t.note}</p>
                         <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">
                           {when.toLocaleDateString()} • {when.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>
                      </div>
                    );
                  })}
               </div>
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}