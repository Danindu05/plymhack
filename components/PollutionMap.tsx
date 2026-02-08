"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Types & Data Structures ---
type PollutionData = {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  components: any;
};

// ⭐ Air Quality Status, Suggestions, and Feedback Icons
const getPollutionExtra = (aqi: number) => {
  const info: Record<number, any> = {
    1: { 
      label: "Very Good", 
      color: "#0df20d", 
      icon: "task_alt", 
      suggestion: "Air is very clean. Perfect for outdoor activities and exercise.",
      feedbackIcon: "🚀", 
      animation: "animate-bounce"
    },
    2: { 
      label: "Fair", 
      color: "#facc15", 
      icon: "info", 
      suggestion: "Air quality is acceptable. Sensitive groups should monitor their time outdoors.",
      feedbackIcon: "✨",
      animation: "animate-pulse"
    },
    3: { 
      label: "Moderate", 
      color: "#f97316", 
      icon: "warning", 
      suggestion: "Moderate pollution levels. People with respiratory issues should wear masks.",
      feedbackIcon: "⚠️",
      animation: "animate-pulse"
    },
    4: { 
      label: "Poor", 
      color: "#ef4444", 
      icon: "dangerous", 
      suggestion: "Unhealthy air quality. Limit unnecessary outdoor travel and keep windows closed.",
      feedbackIcon: "😷",
      animation: "animate-bounce"
    },
    5: { 
      label: "Very Bad", 
      color: "#7e22ce", 
      icon: "skull", 
      suggestion: "Extremely dangerous! Stay indoors, use air purifiers, and avoid all outdoor physical activity.",
      feedbackIcon: "🛑",
      animation: "animate-ping"
    },
  };
  return info[aqi] || info[1];
};

// ⭐ Component to handle Map Zoom and Fly-to transitions
function MapViewHandler({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
}

export default function PollutionMap() {
  const [selectedCity, setSelectedCity] = useState<PollutionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery || !apiKey) return;

    setLoading(true);
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=1&appid=${apiKey}`);
      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];
        setMapCenter([lat, lon]);
        fetchPollution(lat, lon, `${name}, ${country}`);
      } else {
        alert("City not found.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Small delay to ensure the satellite animation is visible
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const fetchPollution = async (lat: number, lng: number, name: string) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`);
      const json = await res.json();
      setSelectedCity({
        name, lat, lng,
        aqi: json.list[0].main.aqi,
        components: json.list[0].components
      });
    } catch (err) {
      console.error(err);
    }
  };

  function MapEvents() {
    useMapEvents({
      click: (e) => {
        setMapCenter([e.latlng.lat, e.latlng.lng]);
        fetchPollution(e.latlng.lat, e.latlng.lng, "Targeted Sector");
      },
    });
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0f172a] overflow-hidden relative">
      
      {/* ⭐ Floating Global Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-[9999] bg-[#0f172a]/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="relative">
              <div className="w-24 h-24 border-b-4 border-[#0df20d] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-4xl text-[#0df20d] animate-pulse">satellite_alt</span>
              </div>
           </div>
           <p className="mt-6 text-sm font-black text-white uppercase tracking-[0.5em] animate-pulse">Relocating Satellites...</p>
        </div>
      )}

      {/* 🗺️ Interactive Map Container */}
      <div className="flex-grow h-[50vh] lg:h-full relative min-h-[400px]">
        {/* Search Bar Overlay */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Enter city name..." 
              className="w-full bg-[#1e293b]/90 backdrop-blur-2xl border border-slate-700 rounded-3xl px-8 py-5 text-white text-sm outline-none focus:border-[#0df20d] transition-all shadow-2xl placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0df20d]">
              <span className="material-symbols-outlined text-2xl">search</span>
            </button>
          </form>
        </div>

        <MapContainer center={[7.8731, 80.7718]} zoom={4} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
          <MapEvents />
          <MapViewHandler center={mapCenter} />
          
          {selectedCity && (
            <Circle
              center={[selectedCity.lat, selectedCity.lng]}
              radius={15000}
              pathOptions={{
                fillColor: getPollutionExtra(selectedCity.aqi).color,
                fillOpacity: 0.5,
                color: getPollutionExtra(selectedCity.aqi).color,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2 text-center font-bold">{selectedCity.name}</div>
              </Popup>
            </Circle>
          )}
        </MapContainer>
      </div>

      {/* 📊 Sidebar Analytics */}
      <div className="w-full pt-24 lg:w-[450px] bg-[#1e293b] border-l border-slate-800 p-8 flex flex-col shadow-2xl z-20 overflow-y-auto overflow-x-hidden">
        {selectedCity ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-700">
            <div>
               <h4 className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.3em] mb-1">Environmental Analysis</h4>
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedCity.name}</h2>
            </div>

            {/* AQI Section */}
            <div className="p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
                 style={{ backgroundColor: `${getPollutionExtra(selectedCity.aqi).color}15` }}>
               
               {/* ⭐ Big Animated Feedback Icon */}
               <div className={`absolute -right-4 -top-4 text-7xl opacity-20 ${getPollutionExtra(selectedCity.aqi).animation}`}>
                  {getPollutionExtra(selectedCity.aqi).feedbackIcon}
               </div>

               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quality Status</p>
               <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-6xl" style={{ color: getPollutionExtra(selectedCity.aqi).color }}>
                    {getPollutionExtra(selectedCity.aqi).icon}
                  </span>
                  <div>
                    <p className="text-3xl font-black uppercase italic" style={{ color: getPollutionExtra(selectedCity.aqi).color }}>
                      {getPollutionExtra(selectedCity.aqi).label}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase">Air Quality Index: {selectedCity.aqi}</p>
                  </div>
               </div>
            </div>

            {/* ⭐ Safety Suggestions Section */}
            <div className="bg-slate-900/60 p-6 rounded-3xl border-l-4 border-[#0df20d] space-y-3 shadow-inner">
               <div className="flex items-center gap-2 text-[#0df20d]">
                  <span className="material-symbols-outlined text-sm">psychology_alt</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Safety Recommendations</p>
               </div>
               <p className="text-sm text-slate-200 font-medium leading-relaxed italic">
                 "{getPollutionExtra(selectedCity.aqi).suggestion}"
               </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatItem label="CO" val={selectedCity.components.co} unit="µg/m³" />
              <StatItem label="NO2" val={selectedCity.components.no2} unit="µg/m³" />
              <StatItem label="PM2.5" val={selectedCity.components.pm2_5} unit="µg/m³" />
              <StatItem label="PM10" val={selectedCity.components.pm10} unit="µg/m³" />
            </div>

            {/* ⭐ Visual Feedback Icon at Bottom */}
            <div className="flex justify-center pt-4">
               <div className={`text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] ${getPollutionExtra(selectedCity.aqi).animation}`}>
                  {getPollutionExtra(selectedCity.aqi).feedbackIcon}
               </div>
            </div>
            
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
             <span className="material-symbols-outlined text-7xl text-slate-700 animate-pulse">location_searching</span>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] max-w-[200px] leading-relaxed">
                Select a location on the map or search for a city to begin analysis
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, val, unit }: any) {
  return (
    <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 hover:border-[#0df20d]/30 transition-all group">
      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 group-hover:text-[#0df20d]">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-xl font-black text-white">{val ? val.toFixed(1) : "0.0"}</p>
        <p className="text-[8px] font-bold text-slate-600 uppercase">{unit}</p>
      </div>
    </div>
  );
}