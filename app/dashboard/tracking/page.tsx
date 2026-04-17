import { LiveTrackingPanel } from "@/components/maps/live-tracking-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrackingSnapshot } from "@/lib/services/operations";

export default async function TrackingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const tracking = await getTrackingSnapshot(user);

  return (
    <div className="space-y-6">
      <SectionHeader title="Live Tracking" description="Real-time field visibility with latitude, longitude, online status, and last active timestamps." />
      <LiveTrackingPanel points={tracking} />
    </div>
  );
}
