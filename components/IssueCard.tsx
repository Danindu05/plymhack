"use client";

import Link from "next/link";
import { Timestamp } from "firebase/firestore";

type IssueCardProps = {
  id: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  createdAt?: Date | Timestamp;
};

const statusColors: Record<string, string> = {
  OPEN: "bg-amber-500/20 text-amber-300",
  CLEANED: "bg-emerald-500/20 text-emerald-300",
  ASSIGNED: "bg-blue-500/20 text-blue-200",
  IN_PROGRESS: "bg-sky-500/20 text-sky-200"
};

export default function IssueCard({
  id,
  description,
  category,
  severity,
  status,
  createdAt
}: IssueCardProps) {
  const created =
    createdAt instanceof Timestamp ? createdAt.toDate() : createdAt || new Date();
  return (
    <Link
      href={`/issue/${id}`}
      className="block rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-brand-green transition"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">{category}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] ?? "bg-slate-800 text-slate-200"}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-200 line-clamp-2">{description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Severity: {severity}/5</span>
        <span>{created.toLocaleString()}</span>
      </div>
    </Link>
  );
}
