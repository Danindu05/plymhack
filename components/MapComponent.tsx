"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Types ---
type Issue = {
  id: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  priorityScore?: number;
  imageUrl?: string;
  location: { lat: number; lng: number };
};

export default function MapComponent() {
  const params = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ⭐ Theme එක පාලනය කරන State එක
  const [isDarkMode, setIsDarkMode] = useState(true);

  const focusLat = params.get("lat") ? Number(params.get("lat")) : null;
  const focusLng = params.get("lng") ? Number(params.get("lng")) : null;
  const focusId = params.get("id");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setIssues(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Category අනුව Marker Icons සැකසීම
  const createCustomIcon = (category: string, severity: number) => {
    const color = severity >= 4 ? "#ef4444" : (isDarkMode ? "#0df20d" : "#059669");
    const iconMap: any = { GARBAGE_WASTE: "delete_sweep", WATER_POLLUTION: "water_drop", POTHOLE_ROAD: "road_check" };
    
    return L.divIcon({
      className: "custom-marker-wrapper",
      html: `<div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
              <div class="relative w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg" 
                   style="background-color: ${isDarkMode ? '#1e293b' : '#ffffff'}; border-color: ${color};">
                <span class="material-symbols-outlined" style="color: ${color}; font-size: 20px;">${iconMap[category] || "warning"}</span>
              </div>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center">Loading Engine...</div>;

  return (
    <div className="relative h-full w-full">
      
      {/* ⭐ Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 z-[1000] bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all flex items-center gap-2 group"
      >
        <span className={`material-symbols-outlined text-lg ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`}>
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 hidden group-hover:block">
          Switch to {isDarkMode ? 'Light' : 'Dark'}
        </span>
      </button>

      <MapContainer
        center={focusLat && focusLng ? [focusLat, focusLng] : [7.8731, 80.7718]}
        zoom={8}
        className="h-full w-full"
        zoomControl={false}
      >
        {/* ⭐ Theme එක අනුව TileLayer එක මාරු කිරීම */}
        <TileLayer 
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />

        {issues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]} 
            icon={createCustomIcon(issue.category, issue.severity)}
          >
            <Popup className="custom-glass-popup">
               <div className={`w-[260px] rounded-3xl overflow-hidden p-4 border shadow-2xl ${isDarkMode ? 'bg-[#1e293b] text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'}`}>
                  <p className="text-[10px] font-black text-[#0df20d] uppercase">{issue.category}</p>
                  <p className="text-sm font-bold mt-2">"{issue.description}"</p>
                  <Link href={`/issue/${issue.id}`} className="mt-4 block bg-[#0df20d] text-black text-center py-2 rounded-xl text-[10px] font-black uppercase">Inspect</Link>
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}