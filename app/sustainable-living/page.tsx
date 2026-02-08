"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import "leaflet/dist/leaflet.css";

// --- Types ---
type HabitabilityStats = {
  city: string;
  lat: number;
  lng: number;
  score: number;
  aqi: number;
  signal: number;
  waste: number;
  access: number;
  priceRange: string;
};

// ⭐ Dynamic Import for Map Component (prevents SSR errors)
const LivingMap = dynamic(() => import("@/components/LivingMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b0f1a] animate-pulse" />
});

export default function SustainableLivingPage() {
  const [activeData, setActiveData] = useState<HabitabilityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleCitySearch = async (city: string) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) return alert("API Key missing in environment!");

    setLoading(true);
    setCurrentSlide(0);

    try {
      // 1. Geocoding: Get Real Coordinates
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];

        // 2. Real-time Air Pollution Data
        const pollRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const pollData = await pollRes.json();
        const realAqi = pollData.list[0].main.aqi;

        // 3. High-level Simulation for other Metrics (Logic-based)
        const simSignal = Math.floor(Math.random() * 5) + 5; // 5-10
        const simWaste = Math.floor(Math.random() * 6) + 4;  // 4-10
        const simAccess = Math.floor(Math.random() * 7) + 3; // 3-10

        // ⭐ SDG 11 Calculation: Weighted Score
        // Formula: (AQI_Weight * 0.4) + (Signal * 0.2) + (Waste * 0.2) + (Access * 0.2)
        const aqiContribution = (6 - realAqi) * 2; // Invert AQI so 1 is best (10 pts)
        const hScore = ( (aqiContribution * 0.4) + (simSignal * 0.2) + (simWaste * 0.2) + (simAccess * 0.2) ).toFixed(1);
        
        // Dynamic Pricing Logic based on Index
        const basePrice = Number(hScore) * 18000;
        const pRange = `$${(basePrice * 0.85).toLocaleString()} - $${(basePrice * 1.15).toLocaleString()}`;

        setActiveData({
          city: `${name}, ${country}`, lat, lng: lon, aqi: realAqi, 
          signal: simSignal, waste: simWaste, access: simAccess,
          score: Number(hScore),
          priceRange: pRange
        });
      } else {
        alert("Location not recognized by satellite network.");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 2000); // UI delay for "Satellite Scan" effect
    }
  };

  return (
    <main className="h-screen w-full flex flex-col lg:flex-row bg-[#0b0f1a] overflow-hidden">
      
      {/* 📡 Satellite Scan Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[10000] bg-[#0b0f1a]/95 backdrop-blur-2xl flex flex-col items-center justify-center">
           <div className="relative">
              <div className="w-32 h-32 border-4 border-[#0df20d]/10 border-t-[#0df20d] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-4xl text-[#0df20d] animate-pulse">radar</span>
              </div>
           </div>
           <h2 className="mt-8 text-xs font-black text-white uppercase tracking-[0.8em] animate-pulse">Scanning Urban Sector...</h2>
        </div>
      )}

      {/* 🗺️ Left: Map Area */}
      <div className="flex-grow h-[45vh] lg:h-full relative">
        <LivingMap 
            center={activeData ? [activeData.lat, activeData.lng] : [7.8731, 80.7718]} 
            onSearch={handleCitySearch}
            themeColor={activeData ? getStatusColor(activeData.score) : "#0df20d"}
        />
      </div>

      {/* 📊 Right: Sliding Analytics Sidebar */}
      <div className="w-full lg:w-[480px] bg-[#121624] border-l border-slate-800 p-10 flex flex-col shadow-2xl z-50 overflow-y-auto custom-scrollbar">
        {activeData ? (
          <div className="space-y-10 animate-in slide-in-from-right duration-700">
            
            {/* Step Indicators */}
            <div className="flex gap-3">
               {[0, 1].map((s) => (
                 <button key={s} onClick={() => setCurrentSlide(s)} className={`h-1.5 transition-all rounded-full ${currentSlide === s ? 'w-12 bg-[#0df20d]' : 'w-4 bg-slate-800'}`}></button>
               ))}
            </div>

            {currentSlide === 0 ? (
              /* SLIDE 1: HABITABILITY OVERVIEW */
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                   <p className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.4em] mb-2">Sustainable Living Index</p>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{activeData.city}</h2>
                </div>

                <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-white/5 flex flex-col items-center shadow-inner relative overflow-hidden group">
                   <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 text-[#0df20d] group-hover:scale-110 transition-transform">SDG11</div>
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Habitability Score</p>
                   <h1 className="text-9xl font-black text-white tracking-tighter" style={{ color: getStatusColor(activeData.score) }}>{activeData.score}</h1>
                   <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Points / 10.0</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <MetricBox label="Connectivity" val={`${activeData.signal}/10`} icon="podcasts" />
                   <MetricBox label="Waste Mgmt" val={`${activeData.waste}/10`} icon="restore_from_trash" />
                   <MetricBox label="Service Reach" val={`${activeData.access}/10`} icon="location_city" />
                   <MetricBox label="Air Purity" val={`Level ${activeData.aqi}`} icon="wind_power" />
                </div>
                
                <button onClick={() => setCurrentSlide(1)} className="w-full py-5 bg-[#0df20d] hover:bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 group">
                   View Affordability Analysis <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">east</span>
                </button>
              </div>
            ) : (
              /* SLIDE 2: PRICING & LOGIC */
              <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div>
                   <p className="text-[10px] font-black text-[#0df20d] uppercase tracking-[0.4em] mb-2">Housing Metrics</p>
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Affordability Report</h2>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0df20d]/10 to-transparent border border-[#0df20d]/10 shadow-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recommended Market Range</p>
                   <h3 className="text-4xl font-black text-[#0df20d] tracking-tight">{activeData.priceRange}</h3>
                   <div className="h-1 w-full bg-slate-800 rounded-full mt-6 overflow-hidden">
                      <div className="h-full bg-[#0df20d] transition-all duration-1000" style={{ width: `${activeData.score * 10}%` }}></div>
                   </div>
                </div>

                <div className="space-y-4">
                   <InsightItem title="Why this price?" text="This region's high signal stability and low pollution levels justify a 20% premium over regional baselines." />
                   <InsightItem title="Sustainability Impact" text="High accessibility scores indicate lower commute requirements, significantly reducing household carbon output." />
                </div>

                <button onClick={() => setCurrentSlide(0)} className="w-full py-4 border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:text-white hover:border-white transition-all">
                   Back to Habitability Index
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
             <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center animate-spin-slow">
                <span className="material-symbols-outlined text-5xl">travel_explore</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-[240px] leading-relaxed">
                Initialize Search or Click Map to Inspect Urban Resilience
             </p>
          </div>
        )}
      </div>
    </main>
  );
}

// --- Internal Helper Components ---
function MetricBox({ label, val, icon }: any) {
  return (
    <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 hover:border-[#0df20d]/20 transition-all">
      <span className="material-symbols-outlined text-[#0df20d] text-lg mb-3">{icon}</span>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-lg font-black text-white">{val}</p>
    </div>
  );
}

function InsightItem({ title, text }: any) {
  return (
    <div className="p-5 bg-slate-900/30 rounded-2xl border-l-2 border-[#0df20d]/40">
       <p className="text-[10px] font-black text-white uppercase mb-2">{title}</p>
       <p className="text-xs text-slate-400 leading-relaxed font-medium italic italic">"{text}"</p>
    </div>
  );
}

function getStatusColor(score: number) {
  if (score > 8) return "#0df20d";
  if (score > 6) return "#facc15";
  if (score > 4) return "#f97316";
  return "#ef4444";
}