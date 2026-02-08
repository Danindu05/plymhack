"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";

/* ---------------------------------- */
/* FIX LEAFLET ICONS                  */
/* ---------------------------------- */

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/* ---------------------------------- */
/* TYPES                              */
/* ---------------------------------- */

type Issue = {
  id: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  location: { lat: number; lng: number };
};

/* ---------------------------------- */
/* SEVERITY COLORS                    */
/* ---------------------------------- */

function coloredIcon(color: string) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });
}

function getIcon(severity: number) {
  if (severity >= 5) return coloredIcon("red");
  if (severity >= 4) return coloredIcon("orange");
  if (severity >= 3) return coloredIcon("yellow");
  return coloredIcon("green");
}

/* ---------------------------------- */
/* FLY TO                             */
/* ---------------------------------- */

function FlyTo({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 17, { duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null;
}

/* ---------------------------------- */
/* MARKER WITH AUTO OPEN              */
/* ---------------------------------- */

function IssueMarker({
  issue,
  focusId
}: {
  issue: Issue;
  focusId: string | null;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (issue.id === focusId && markerRef.current) {
      markerRef.current.openPopup(); // ✅ correct way
    }
  }, [focusId, issue.id]);

  return (
    <Marker
      ref={markerRef}
      position={[issue.location.lat, issue.location.lng]}
      icon={getIcon(issue.severity)}
    >
      <Popup>
        <div className="space-y-1 min-w-[180px]">
          <p className="font-semibold">{issue.category}</p>
          <p className="text-sm">{issue.description}</p>
          <p className="text-xs">Severity: {issue.severity}</p>
          <p className="text-xs">Status: {issue.status}</p>
          <a
            href={`/issue/${issue.id}`}
            className="text-blue-400 underline text-xs"
          >
            View details
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

/* ---------------------------------- */
/* PAGE                               */
/* ---------------------------------- */

export default function MapPage() {
  const params = useSearchParams();

  const focusLat = Number(params.get("lat"));
  const focusLng = Number(params.get("lng"));
  const focusId = params.get("id");

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      }));

      setIssues(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <main className="h-screen w-full">
      {loading ? (
        <div className="flex h-full items-center justify-center text-slate-400">
          Loading map...
        </div>
      ) : (
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={8}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <FlyTo lat={focusLat} lng={focusLng} />

          {issues.map((issue) => (
            <IssueMarker
              key={issue.id}
              issue={issue}
              focusId={focusId}
            />
          ))}
        </MapContainer>
      )}
    </main>
  );
}
