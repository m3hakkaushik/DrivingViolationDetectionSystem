"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Use dynamic imports for Leaflet as it requires 'window'
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface GpsMapPinProps {
  lat: number;
  lng: number;
  height?: string;
  className?: string;
}

export default function GpsMapPin({
  lat,
  lng,
  height = "200px",
  className = "",
}: GpsMapPinProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Import leaflet directly to fix missing marker icons issue in Next.js
    import("leaflet").then((leaflet) => {
      const DefaultIcon = leaflet.Icon.Default.prototype as any;
      delete DefaultIcon._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  if (!isMounted || !L) {
    return (
      <div
        className={`w-full bg-slate-100 animate-pulse flex items-center justify-center rounded-[16px] ${className}`}
        style={{ height }}
      >
        <span className="label-md" style={{ color: "var(--ash)" }}>Loading map...</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[16px] border border-slate-200 shadow-sm ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
      
      {/* Decorative overlay to match brand */}
      <div className="absolute top-2 left-2 z-[400] px-2 py-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-md shadow-sm pointer-events-none">
        <span className="label-sm" style={{ color: "var(--electric-lavender)" }}>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
