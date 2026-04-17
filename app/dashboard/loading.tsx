export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-3xl bg-secondary/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl bg-secondary/70" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[340px] animate-pulse rounded-3xl bg-secondary/70" />
        <div className="h-[340px] animate-pulse rounded-3xl bg-secondary/70" />
      </div>
    </div>
  );
}
