import { cn } from "@/lib/utils";

/**
 * Skeleton — base placeholder com pulse animation.
 * Use diretamente para placeholders custom, ou use as variantes abaixo
 * (CardSkeleton, ListSkeleton, DashboardSkeleton).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "animate-pulse rounded-md bg-[rgba(0,128,255,0.08)]",
        className
      )}
      {...props}
    >
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

/**
 * CardSkeleton — placeholder genérico para um card (título + 2 linhas + footer).
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6 space-y-4",
        className
      )}
    >
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * ListSkeleton — N linhas com avatar + texto.
 */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(0,128,255,0.06)] bg-white/40"
        >
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton — 4 stat cards + lista de itens recentes.
 * Match the actual /admin dashboard layout for graceful loading.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 space-y-3"
          >
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}

/**
 * EditorSkeleton — preview + properties side-by-side.
 * Match the BuilderPanel layout.
 */
export function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="flex gap-4 border-b pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
