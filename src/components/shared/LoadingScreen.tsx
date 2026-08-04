/**
 * Branded loading indicator shown by Next.js's automatic Suspense fallback
 * during page navigation (see app/loading.tsx) — only the content area
 * swaps to this; Header/Footer/BottomNav stay put since they live outside
 * the { children } boundary that loading.tsx wraps.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-[#1B1F3B]/10 border-t-[#E8A33D]" />
        <span className="text-lg font-[var(--font-display)] font-bold text-[#1B1F3B]">T</span>
      </div>
      <p className="text-sm font-medium text-[#1B1F3B]/50">Loading…</p>
    </div>
  );
}
