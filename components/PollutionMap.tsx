"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Types ---
type PollutionData = {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  components: any;
};

const getPollutionStatus = (aqi: number) => {
  const statusMap: Record<number, any> = {
    1: { label: "Very Good", color: "#0df20d", icon: "sentiment_very_satisfied" },
    2: { label: "Fair", color: "#facc15", icon: "sentiment_satisfied" },
    3: { label: "Moderate", color: "#f97316", icon: "sentiment_neutral" },
    4: { label: "Poor", color: "#ef4444", icon: "sentiment_dissatisfied" },
    5: { label: "Very Bad", color: "#7e22ce", icon: "warning" },
  };
  return statusMap[aqi] || statusMap[1];
};

export default function PollutionMap() {
  const [selectedCity, setSelectedCity] = useState<PollutionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  // ⭐ ලෝකයේ ඕනෑම තැනක නමක් සොයා දත්ත ලබා ගැනීම (Search Logic)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery || !apiKey) return;

    setLoading(true);
    try {
      // 1. Geocoding API එකෙන් නගරයේ නමට අදාළ Lat/Lng සොයා ගැනීම
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=1&appid=${apiKey}`);
      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];
        fetchPollution(lat, lon, `${name}, ${country}`);
      } else {
        alert("City not found. Try another location.");
      }
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ ඕනෑම Lat/Lng එකක Pollution Data ලබා ගැනීම
  const fetchPollution = async (lat: number, lng: number, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`);
      const json = await res.json();
      
      setSelectedCity({
        name,
        lat,
        lng,
        aqi: json.list[0].main.aqi,
        components: json.list[0].components
      });
    } catch (err) {
      console.error("Pollution Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Map එකේ Click කරන තැන දත්ත පෙන්වීමේ Component එක
  function MapEvents() {
    useMapEvents({
      click: (e) => {
        fetchPollution(e.latlng.lat, e.latlng.lng, "Targeted Sector");
      },
    });
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0f172a] overflow-hidden">
      
      {/* 🗺️ Interactive Map */}
      <div className="flex-grow h-[50vh] lg:h-full relative min-h-[400px]">
        
        {/* Search Bar Overlay */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Search any City or Country..." 
              className="w-full bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700 rounded-2xl px-6 py-4 text-white text-xs outline-none focus:border-[#0df20d] transition-all shadow-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0df20d]">
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>
        </div>

        <MapContainer 
          center={[7.8731, 80.7718]} 
          zoom={4} // මුළු ලෝකයම පෙනෙන සේ Zoom අඩු කළා
          className="h-full w-full z-0" 
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
          <MapEvents />
          
          {selectedCity && (
            <Circle
              center={[selectedCity.lat, selectedCity.lng]}
              radius={20000} // ප්‍රදේශය පෙන්වීමට විශාල Radius එකක්
              pathOptions={{
                fillColor: getPollutionStatus(selectedCity.aqi).color,
                fillOpacity: 0.5,
                color: getPollutionStatus(selectedCity.aqi).color,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center text-[10px] font-black uppercase text-slate-800">
                  {selectedCity.name}
                </div>
              </Popup>
            </Circle>
          )}
        </MapContainer>
      </div>

      {/* 📊 Sidebar Analytics */}
      <div className="w-full lg:w-96 bg-[#1e293b] border-l border-slate-800 p-8 flex flex-col shadow-2xl z-20 overflow-y-auto">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-[#0df20d]/20 border-t-[#0df20d] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Atmosphere...</p>
          </div>
        ) : selectedCity ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div>
               <h4 className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.3em] mb-1">Global Intelligence</h4>
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedCity.name}</h2>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 transition-all"
                 style={{ backgroundColor: `${getPollutionStatus(selectedCity.aqi).color}22`, boxShadow: `0 0 20px ${getPollutionStatus(selectedCity.aqi).color}33` }}>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">AQI Score</p>
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-4xl" style={{ color: getPollutionStatus(selectedCity.aqi).color }}>
                    {getPollutionStatus(selectedCity.aqi).icon}
                  </span>
                  <p className="text-2xl font-black uppercase italic" style={{ color: getPollutionStatus(selectedCity.aqi).color }}>
                    {getPollutionStatus(selectedCity.aqi).label}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatItem label="CO" val={selectedCity.components.co} unit="µg/m³" />
              <StatItem label="NO2" val={selectedCity.pollution?.components?.no2 ?? selectedCity.components.no2} unit="µg/m³" />
              <StatItem label="PM2.5" val={selectedCity.components.pm2_5} unit="µg/m³" />
              <StatItem label="PM10" val={selectedCity.components.pm10} unit="µg/m³" />
            </div>
            
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
               Click anywhere on the map to initiate a deep atmospheric scan.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
             <span className="material-symbols-outlined text-6xl text-slate-700 animate-pulse">explore</span>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Search for a city or click on the map to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, val, unit }: any) {
  return (
    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-lg font-black text-white">{val ? val.toFixed(1) : "0.0"}</p>
        <p className="text-[8px] font-bold text-slate-600 uppercase">{unit}</p>
      </div>
    </div>
  );
}