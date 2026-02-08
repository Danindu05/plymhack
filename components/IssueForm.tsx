"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/util";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-xl" />
});

export default function IssueForm() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("GARBAGE_WASTE");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    if (!auth.currentUser || lat == null || lng == null) {
      setError("Please select a location on the map.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = "";
      let imageKey = "";

      /* --- S3 UPLOAD START --- */
      if (file) {
        const prep = await fetch("/api/s3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type })
        });
        
        const { uploadUrl, publicUrl, key } = await prep.json();
        
        // පින්තූරය S3 වලට යවනවා
        await fetch(uploadUrl, { 
          method: "PUT", 
          headers: { "Content-Type": file.type }, 
          body: file 
        });

        imageUrl = publicUrl;
        imageKey = key;
        console.log("Uploaded Image URL:", imageUrl); // Debugging සඳහා
      }
      /* --- S3 UPLOAD END --- */

      const geohash = geohashForLocation([lat, lng]);

      await addDoc(collection(db, "issues"), {
        category,
        description,
        imageUrl, // පින්තූරයේ ලින්ක් එක Firestore එකට යනවා
        imageKey,   
        location: { lat, lng, geohash },
        status: "OPEN",
        severity,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        counts: { stillThere: 0, cleaned: 0 },
        timeline: [{ at: new Date(), by: auth.currentUser.uid, status: "OPEN", note: "Report submitted" }]
      });

      setLoading(false);
      setIsSending(true);

      setTimeout(() => {
        setIsSending(false);
        setIsSuccess(true);
      }, 3500);

    } catch (err: any) {
      console.error("Submission Error:", err);
      setError("Failed to transmit. Check your internet or S3 keys.");
      setLoading(false);
    }
  };

  if (isSending) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      <div className="relative w-24 h-24">
        {/* Background Cloud */}
        <span className="material-symbols-outlined text-8xl text-slate-800 absolute inset-0 text-center">cloud</span>
        
        {/* Fixed Animation CSS using Standard HTML Style Tag */}
        <div className="absolute inset-0 flex items-center justify-center send-animation">
          <span className="material-symbols-outlined text-4xl text-[#0df20d] drop-shadow-[0_0_10px_rgba(13,242,13,0.5)]">mail</span>
        </div>
      </div>
      <h2 className="text-xl font-black text-white italic tracking-widest uppercase animate-pulse">Transmitting...</h2>
      
      <style>{`
        @keyframes fly-away {
          0% { transform: translate(-60px, 30px) scale(0.3); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(100px, -50px) scale(0.5); opacity: 0; }
        }
        .send-animation {
          animation: fly-away 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );

  if (isSuccess) return (
    <div className="text-center py-16 space-y-6 animate-in zoom-in">
      <div className="w-20 h-20 bg-[#0df20d]/10 rounded-full flex items-center justify-center mx-auto border border-[#0df20d]/30">
        <span className="material-symbols-outlined text-5xl text-[#0df20d]">verified</span>
      </div>
      <h1 className="text-4xl font-black text-white uppercase italic">Report Sent!</h1>
      <button onClick={() => router.push('/my-issues')} className="bg-[#0df20d] text-black font-black px-8 py-3 rounded-xl uppercase text-xs">My Dashboard</button>
    </div>
  );

  return (
    <form className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 space-y-6 shadow-2xl" onSubmit={handleSubmit}>
      <h2 className="text-xl font-black text-white italic uppercase tracking-wider flex items-center gap-2">
        <span className="material-symbols-outlined text-[#0df20d]">add_location_alt</span>
        Submit Incident
      </h2>

      <MapPicker lat={lat} lng={lng} setPos={(la, ln) => { setLat(la); setLng(ln); }} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-slate-500 uppercase text-[10px] font-bold">Category</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#0df20d]" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="GARBAGE_WASTE">Garbage / Waste</option>
            <option value="AIR_POLLUTION">Air pollution</option>
            <option value="WATER_POLLUTION">Water pollution</option>
            <option value="POTHOLE_ROAD">Pothole / Road</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-slate-500 uppercase text-[10px] font-bold">Severity: {severity}</label>
          <input type="range" min={1} max={5} className="w-full h-10 accent-[#0df20d]" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
        </div>
      </div>

      <textarea className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#0df20d]" placeholder="Describe the issue..." value={description} onChange={(e) => setDescription(e.target.value)} required />

      <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-800">
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {preview ? <img src={preview} className="max-h-32 mx-auto rounded-lg" /> : <p className="text-slate-500 text-[10px] font-bold uppercase">Click to add Photo evidence</p>}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button disabled={loading} className="w-full bg-[#0df20d] hover:bg-[#0be00b] text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(13,242,13,0.3)] uppercase tracking-widest text-xs">
        {loading ? "Processing..." : "Transmit Report"}
      </button>
    </form>
  );
}