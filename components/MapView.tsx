"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Category, Status, severityLabels } from "@/lib/util";
import Link from "next/link";

type IssueLite = {
  id: string;
  category: Category;
  status: Status;
  severity: number;
  description: string;
  aiSummary?: string;
  location: { lat: number; lng: number };
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function categoryColor(category: Category) {
  const colors: Record<Category, string> = {
    GARBAGE_WASTE: "#22c55e",
    AIR_POLLUTION: "#0ea5e9",
    WATER_POLLUTION: "#3b82f6",
    SOIL_POLLUTION: "#b45309",
    NOISE_POLLUTION: "#f97316",
    PLASTIC_POLLUTION: "#a855f7",
    LIGHT_POLLUTION: "#facc15",
    POTHOLE_ROAD: "#ef4444",
    OTHER: "#94a3b8"
  };
  return colors[category] || "#22c55e";
}

export default function MapView({ issues, height = 520 }: { issues: IssueLite[]; height?: number }) {
  const bounds = useMemo(() => {
    if (!issues.length) return null;
    const latLngs = issues.map((i) => [i.location.lat, i.location.lng]) as [number, number][];
    return L.latLngBounds(latLngs);
  }, [issues]);

  useEffect(() => {
    (L.Icon.Default as any).mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });
  }, []);

  const center = issues[0]?.location ?? { lat: 14.5995, lng: 120.9842 }; // fallback

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ height, width: "100%" }}
      bounds={bounds ?? undefined}
      scrollWheelZoom
      className="overflow-hidden"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.location.lat, issue.location.lng]}
          icon={icon}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide" style={{ color: categoryColor(issue.category) }}>
                {issue.category.replace("_", " ")}
              </p>
              <p className="font-semibold">{issue.aiSummary || issue.description.slice(0, 80)}</p>
              <p className="text-xs text-slate-500">Severity: {severityLabels[issue.severity]} /5</p>
              <p className="text-xs">Status: {issue.status}</p>
              <Link className="text-brand-green text-sm underline" href={`/issue/${issue.id}`}>
                View issue
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
