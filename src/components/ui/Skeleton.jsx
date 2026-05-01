import { cn } from "../../lib/utils";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="page-shell space-y-6">
      <Skeleton className="h-40 w-full rounded-[28px]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-32" key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function ListSkeleton({ cards = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div className="surface-outline rounded-3xl p-5" key={index}>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-4 h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingScreen({ message = "Loading your workspace..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel flex w-full max-w-md flex-col items-center rounded-[32px] px-8 py-10 text-center">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-r-teal-700" />
        <h2 className="mt-6 text-2xl font-semibold text-slate-900">ScholarHub</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
