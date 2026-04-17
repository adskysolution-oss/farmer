export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(13,148,136,0.3),transparent_24%),linear-gradient(135deg,#020617,#0f172a)]" />
        <div className="panel-grid absolute inset-0 opacity-25" />
        <div className="relative flex h-full flex-col justify-between px-16 py-14">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              Enterprise Loan Operations Platform
            </div>
            <h1 className="mt-8 max-w-xl font-display text-5xl font-semibold leading-tight text-balance">
              Control every farmer journey, partner payout, and field operation from one command center.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Premium CRM workflows for intake, calling, disbursal, commission accounting, live employee visibility, and audit-friendly operations.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Realtime Tracking", "Field location, online state, and last active visibility"],
              ["Payment Controls", "Razorpay, PhonePe, and custom gateway orchestration"],
              ["Commission Ledger", "Transparent partner and employee earning splits"],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="font-display text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">{children}</div>
    </div>
  );
}
