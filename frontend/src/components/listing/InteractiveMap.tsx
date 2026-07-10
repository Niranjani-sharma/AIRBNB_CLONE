"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

export interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  label?: string; // e.g. "₹18,200" → rendered as a price pin
  title?: string;
  href?: string;
}

function priceIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#fff;color:#222;border:1px solid #222;border-radius:9999px;padding:3px 9px;font-weight:700;font-size:12px;box-shadow:0 1px 6px rgba(0,0,0,.35);white-space:nowrap;transform:translate(-50%,-50%)">${label}</div>`,
    iconSize: [0, 0],
  });
}

function homeIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:#FF385C;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4);transform:translate(-50%,-50%)"></div>`,
    iconSize: [0, 0],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(
        points.map((p) => [p.lat, p.lng] as [number, number]),
        { padding: [48, 48] }
      );
    }
  }, [map, points]);
  return null;
}

export default function InteractiveMap({
  points,
  center,
  zoom = 13,
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
}) {
  if (points.length === 0) return null;
  const c = center ?? [points[0].lat, points[0].lng];

  return (
    <MapContainer
      center={c}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={p.label ? priceIcon(p.label) : homeIcon()}>
          {(p.title || p.href) && (
            <Popup>
              {p.href ? (
                <a href={p.href} className="font-medium text-[#222] underline">
                  {p.title ?? "View listing"}
                </a>
              ) : (
                <span>{p.title}</span>
              )}
            </Popup>
          )}
        </Marker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
