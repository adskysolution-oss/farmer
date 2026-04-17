"use client";

import dynamic from "next/dynamic";

const LiveTrackingMap = dynamic(() => import("@/components/maps/live-tracking-map").then((mod) => mod.LiveTrackingMap), {
  ssr: false,
});

export function LiveTrackingPanel({
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
  return <LiveTrackingMap points={points} />;
}
