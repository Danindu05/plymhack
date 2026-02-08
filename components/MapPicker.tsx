"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Marker icons fix
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapEvents({ setPos }: { setPos: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPos(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  lat: number | null;
  lng: number | null;
  setPos: (la: number, ln: number) => void;
}

export default function MapPicker({ lat, lng, setPos }: Props) {
  const center: [number, number] = lat && lng ? [lat, lng] : [6.9271, 79.8612];

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800 z-0 relative">
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents setPos={setPos} />
        {lat && lng && <Marker position={[lat, lng]} icon={icon} />}
      </MapContainer>
    </div>
  );
}