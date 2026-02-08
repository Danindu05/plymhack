import { Timestamp } from "firebase/firestore";

export type Category =
  | "GARBAGE_WASTE"
  | "AIR_POLLUTION"
  | "WATER_POLLUTION"
  | "SOIL_POLLUTION"
  | "NOISE_POLLUTION"
  | "PLASTIC_POLLUTION"
  | "LIGHT_POLLUTION"
  | "POTHOLE_ROAD"
  | "OTHER";

export type Status = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

export interface IssueCounts {
  stillThere: number;
  cleaned: number;
}

export const categoryWeight: Record<Category, number> = {
  GARBAGE_WASTE: 6,
  AIR_POLLUTION: 5,
  WATER_POLLUTION: 5,
  SOIL_POLLUTION: 4,
  NOISE_POLLUTION: 3,
  PLASTIC_POLLUTION: 4,
  LIGHT_POLLUTION: 2,
  POTHOLE_ROAD: 3,
  OTHER: 2
};

// Simple, documented priority score formula:
// priorityScore = categoryWeight + (severity * 2)
//               + (stillThere * 1.5 - cleaned * 1)
//               + timeOpenWeight
// timeOpenWeight = cappedHoursOpen / 12 (max 8) — keeps older open issues hotter.
// RESOLVED issues get timeOpenWeight = 0 to cool them down.
export function calcPriorityScore(opts: {
  category: Category;
  severity: number;
  counts: IssueCounts;
  createdAt: Date | Timestamp;
  status: Status;
}) {
  const created = opts.createdAt instanceof Timestamp ? opts.createdAt.toDate() : opts.createdAt;
  const hoursOpen = Math.max(
    0,
    (Date.now() - created.getTime()) / (1000 * 60 * 60)
  );
  const timeOpenWeight = opts.status === "RESOLVED" ? 0 : Math.min(8, hoursOpen / 12);
  const confirmationsWeight = opts.counts.stillThere * 1.5 - opts.counts.cleaned * 1;
  const score =
    (categoryWeight[opts.category] || 1) +
    opts.severity * 2 +
    confirmationsWeight +
    timeOpenWeight;
  return Math.max(0, Number(score.toFixed(2)));
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const severityLabels: Record<number, string> = {
  1: "Minor",
  2: "Noticeable",
  3: "Serious",
  4: "Major",
  5: "Critical"
};
