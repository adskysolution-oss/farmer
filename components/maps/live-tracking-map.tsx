"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

const onlineMarker = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:#16a34a;border:3px solid rgba(255,255,255,0.95);box-shadow:0 10px 24px rgba(22,163,74,0.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const offlineMarker = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:#ef4444;border:3px solid rgba(255,255,255,0.95);box-shadow:0 10px 24px rgba(239,68,68,0.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function LiveTrackingMap({
  points,
}: {
  points: Array<{
    id: string;
    name: string;
    partner: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
    lastActive: Date | string;
    designation: string;
  }>;
}) {
  const center = points.length ? [points[0].latitude, points[0].longitude] : [22.9734, 78.6569];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Live Employee Tracking</CardTitle>
        <CardDescription>GPS visibility for on-ground employees and callers with online state and latest heartbeat.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-border">
          <MapContainer center={center as [number, number]} zoom={6} className="h-[420px] w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
                icon={point.isOnline ? onlineMarker : offlineMarker}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{point.name}</p>
                    <p>{point.designation}</p>
                    <p>{point.partner}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="space-y-4">
          {points.map((point) => (
            <div key={point.id} className="rounded-3xl border border-border/70 bg-card/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{point.name}</p>
                  <p className="text-sm text-muted-foreground">{point.designation}</p>
                </div>
                <Badge variant={point.isOnline ? "success" : "destructive"}>{point.isOnline ? "Online" : "Offline"}</Badge>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Partner</span>
                  <span className="font-medium text-foreground">{point.partner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coordinates</span>
                  <span className="font-medium text-foreground">{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last active</span>
                  <span className="font-medium text-foreground">{formatRelativeTime(point.lastActive)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
