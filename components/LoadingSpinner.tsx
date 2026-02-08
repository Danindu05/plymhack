"use client";

export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-300 text-sm">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
