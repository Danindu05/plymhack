"use client";

import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";

export default function LivingMap({ center, onSearch, themeColor }: any) {
  const [query, setQuery] = useState("");

  // ⭐ Component to handle smooth camera transitions
  function MapFlyHandler({ center }: any) {
    const map = useMap();
    useEffect(() => {
      if (center) map.flyTo(center, 13, { duration: 3, easeLinearity: 0.2 });
    }, [center, map]);
    return null;
  }

  // ⭐ Allow users to click anywhere to start an analysis
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        onSearch(`${e.latlng.lat},${e.latlng.lng}`);
      },
    });
    return null;
  }

  return (
    <div className="h-full w-full relative">
      
      {/* 🔍 Search Input Overlay */}
      <div className="absolute top-24 left-10 z-[1000] w-[350px] group">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Scan City Name..." 
            className="w-full bg-[#121624]/90 backdrop-blur-3xl border border-slate-800 rounded-3xl px-8 py-5 text-white text-xs outline-none focus:border-[#0df20d] shadow-2xl transition-all placeholder:text-slate-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
          />
          <button 
             onClick={() => onSearch(query)}
             className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0df20d] transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">radar</span>
          </button>
        </div>
        <p className="mt-4 ml-4 text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
           Enter Global Location or Click on Map to Begin Scan
        </p>
      </div>

      <MapContainer center={center} zoom={4} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
        
        <MapFlyHandler center={center} />
        <MapClickHandler />
        
        {/* ⭐ Radius Circle representing the surveyed zone */}
        <Circle 
          center={center} 
          radius={5000} 
          pathOptions={{ 
            fillColor: themeColor, 
            color: themeColor, 
            fillOpacity: 0.25,
            weight: 2,
            dashArray: "10, 10" 
          }} 
        />
      </MapContainer>
    </div>
  );
}