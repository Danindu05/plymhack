"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Types & Interfaces ---
type City = { name: string; lat: number; lng: number };

const getPollutionStatus = (aqi: number) => {
  const statusMap: Record<number, any> = {
    1: { label: "Very Good", color: "#0df20d", icon: "sentiment_very_satisfied", shadow: "shadow-[0_0_15px_#0df20d]" },
    2: { label: "Fair", color: "#facc15", icon: "sentiment_satisfied", shadow: "shadow-[0_0_15px_#facc15]" },
    3: { label: "Moderate", color: "#f97316", icon: "sentiment_neutral", shadow: "shadow-[0_0_15px_#f97316]" },
    4: { label: "Poor", color: "#ef4444", icon: "sentiment_dissatisfied", shadow: "shadow-[0_0_20px_#ef4444]" },
    5: { label: "Very Bad", color: "#7e22ce", icon: "warning", shadow: "shadow-[0_0_25px_#7e22ce]" },
  };
  return statusMap[aqi] || statusMap[1];
};

export default function PollutionMap() {
  const [citiesData, setCitiesData] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sri Lankan Major Cities
  const cities: City[] = [
    { name: "Colombo", lat: 6.9271, lng: 79.8612 },
    { name: "Kandy", lat: 7.2906, lng: 80.6337 },
    { name: "Galle", lat: 6.0535, lng: 80.2210 },
    { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
    { name: "Kurunegala", lat: 7.4817, lng: 80.3609 },
  ];

  useEffect(() => {
    const fetchPollution = async () => {
      // ⭐ Fetching API Key from environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      if (!apiKey) {
        console.error("API Key is missing! Check your .env.local file.");
        return;
      }

      try {
        const results = await Promise.all(
          cities.map(async (city) => {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}`
            );
            const json = await res.json();
            return { ...city, pollution: json.list[0] };
          })
        );
        setCitiesData(results);
      } catch (err) {
        console.error("Pollution API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPollution();
  }, []);

  const createIcon = (aqi: number) => {
    const status = getPollutionStatus(aqi);
    return L.divIcon({
      className: "custom-pollution-icon",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 transition-all hover:scale-125 ${aqi === 5 ? 'animate-bounce' : ''}" 
               style="background-color: ${status.color}; box-shadow: 0 0 15px ${status.color}66;">
            <span class="material-symbols-outlined text-white text-[16px]">${status.icon}</span>
          </div>
        </div>`,
      iconSize: [32, 32],
    });
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-[#0f172a]">
       <div className="w-12 h-12 border-4 border-[#0df20d]/20 border-t-[#0df20d] rounded-full animate-spin"></div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Synchronizing Atmospheric Data...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0f172a] overflow-hidden">
      
      {/* Interactive Map */}
      <div className="flex-grow h-[50vh] lg:h-full relative">
        <MapContainer center={[7.8731, 80.7718]} zoom={8} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {citiesData.map((city, idx) => (
            <Marker 
              key={idx} 
              position={[city.lat, city.lng]} 
              icon={createIcon(city.pollution.main.aqi)}
              eventHandlers={{ click: () => setSelectedCity(city) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Analytics Sidebar */}
      <div className="w-full lg:w-96 bg-[#1e293b] border-l border-slate-800 p-8 flex flex-col shadow-2xl z-20 overflow-y-auto">
        {selectedCity ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div>
               <h4 className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.3em] mb-1">Live Feed Analytics</h4>
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{selectedCity.name}</h2>
            </div>

            <div className={`p-6 rounded-3xl border border-white/5 transition-all ${getPollutionStatus(selectedCity.pollution.main.aqi).shadow}`}
                 style={{ backgroundColor: `${getPollutionStatus(selectedCity.pollution.main.aqi).color}11` }}>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Air Quality Index</p>
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-4xl" style={{ color: getPollutionStatus(selectedCity.pollution.main.aqi).color }}>
                    {getPollutionStatus(selectedCity.pollution.main.aqi).icon}
                  </span>
                  <p className="text-2xl font-black uppercase italic" style={{ color: getPollutionStatus(selectedCity.pollution.main.aqi).color }}>
                    {getPollutionStatus(selectedCity.pollution.main.aqi).label}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatItem label="CO" val={selectedCity.pollution.components.co} unit="µg/m³" />
              <StatItem label="NO2" val={selectedCity.pollution.components.no2} unit="µg/m³" />
              <StatItem label="O3" val={selectedCity.pollution.components.o3} unit="µg/m³" />
              <StatItem label="SO2" val={selectedCity.pollution.components.so2} unit="µg/m³" />
            </div>

            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
               Real-time satellite metrics verified. Global AQI standards applied.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
             <span className="material-symbols-outlined text-6xl text-slate-700">analytics</span>
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Select a city marker for detailed analysis</p>
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
        <p className="text-lg font-black text-white">{val.toFixed(1)}</p>
        <p className="text-[8px] font-bold text-slate-600 uppercase">{unit}</p>
      </div>
    </div>
  );
}