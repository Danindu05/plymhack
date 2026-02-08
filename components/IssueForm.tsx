"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { useRouter } from "next/navigation";
import { Category, severityLabels } from "@/lib/util";

export default function IssueForm() {
  const router = useRouter();

  const [category, setCategory] = useState<Category>("GARBAGE_WASTE");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false); // Backend processing state
  const [isSending, setIsSending] = useState(false); // Envelope animation state
  const [isSuccess, setIsSuccess] = useState(false); // Final feedback state
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!auth.currentUser || lat == null || lng == null) return;

    setLoading(true);

    try {
      // 1. Logic for Summary/S3 goes here (Keeping it simple for the UI flow)
      const geohash = geohashForLocation([lat, lng]);

      // 2. Add to Firestore
      await addDoc(collection(db, "issues"), {
        category,
        description,
        location: { lat, lng, geohash },
        status: "OPEN",
        severity,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid, // Updated to save just UID for user dashboard query
        counts: { stillThere: 0, cleaned: 0 },
        timeline: [
          {
            at: new Date(),
            by: auth.currentUser.uid,
            status: "OPEN",
            note: "Report submitted"
          }
        ]
      });

      // --- Animation Sequence ---
      setLoading(false);
      setIsSending(true); // Start Envelope animation

      // Wait for animation to complete (approx 3 seconds)
      setTimeout(() => {
        setIsSending(false);
        setIsSuccess(true); // Show final success message
      }, 3500);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* UI: ENVELOPE ANIMATION (SENDING) */
  /* -------------------------------------------------- */
  if (isSending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
        <div className="relative w-24 h-24">
           {/* Global Cloud Icon (Stable) */}
           <span className="material-symbols-outlined text-8xl text-slate-800 absolute inset-0 text-center">cloud</span>
           
           {/* Flying Envelope Animation */}
           <div className="absolute inset-0 flex items-center justify-center animate-fly-envelope">
              <span className="material-symbols-outlined text-4xl text-[#0df20d] drop-shadow-[0_0_10px_rgba(13,242,13,0.5)]">mail</span>
           </div>
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-xl font-black text-white italic tracking-widest uppercase">Transmitting Data...</h2>
           <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Encrypting and Sending to Network</p>
        </div>

        <style jsx>{`
          @keyframes fly {
            0% { transform: translate(-100px, 40px) scale(0.2); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translate(150px, -60px) scale(0.5); opacity: 0; }
          }
          .animate-fly-envelope {
            animation: fly 2s infinite ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* UI: SUCCESS FEEDBACK */
  /* -------------------------------------------------- */
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-in zoom-in duration-700">
        <div className="w-20 h-20 bg-[#0df20d]/10 rounded-full flex items-center justify-center border border-[#0df20d]/30 shadow-[0_0_30px_rgba(13,242,13,0.2)]">
           <span className="material-symbols-outlined text-5xl text-[#0df20d] animate-pulse">verified</span>
        </div>
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Report Received!</h1>
           <p className="text-slate-400 text-sm max-w-xs mx-auto">
             Your report has been securely transmitted. Our response team will begin verification shortly.
           </p>
        </div>
        <button 
          onClick={() => router.push('/my-issues')}
          className="bg-[#0df20d] text-black font-black px-8 py-3 rounded-xl uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_20px_rgba(13,242,13,0.3)]"
        >
          View My Dashboard
        </button>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* UI: INITIAL FORM */
  /* -------------------------------------------------- */
  return (
    <form className="bg-[#1e293b]/80 backdrop-blur-md border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500" onSubmit={handleSubmit}>
      
      <div className="absolute top-0 right-0 p-4 opacity-5">
         <span className="material-symbols-outlined text-9xl">emergency_share</span>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
         <span className="material-symbols-outlined text-[#0df20d]">add_circle</span>
         <h2 className="text-lg font-black text-white italic tracking-wider uppercase">New Incident Report</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#0df20d] outline-none transition-all text-sm"
            value={category} 
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="GARBAGE_WASTE">Garbage / Waste</option>
            <option value="AIR_POLLUTION">Air pollution</option>
            <option value="WATER_POLLUTION">Water pollution</option>
            <option value="POTHOLE_ROAD">Pothole / road</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Severity: {severity}</label>
          <input
            type="range" min={1} max={5}
            className="w-full h-10 accent-[#0df20d] cursor-pointer"
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
        <textarea
          rows={4}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#0df20d] outline-none transition-all resize-none text-sm"
          placeholder="What did you observe? Provide as much detail as possible..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Evidence Photo</label>
        <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors text-center cursor-pointer">
          <input
            type="file" accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {preview ? (
            <img src={preview} className="max-h-40 mx-auto rounded-lg shadow-lg border border-slate-700" alt="Evidence Preview" />
          ) : (
            <div className="py-4 space-y-2">
              <span className="material-symbols-outlined text-slate-600 text-3xl">add_a_photo</span>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-tighter">Click to upload photo evidence</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

      <button 
        disabled={loading}
        className="w-full bg-[#0df20d] hover:bg-[#0be00b] text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(13,242,13,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs italic"
      >
        {loading ? (
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
             Verifying...
          </div>
        ) : "Transmit Report"}
      </button>
    </form>
  );
}