import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { calcPriorityScore, Category, IssueCounts, Status } from "./util";

export interface IssuePayload {
  category: Category;
  description: string;
  aiSummary: string;
  aiRecommendedAction?: string;
  imageUrl: string;
  imageKey: string;
  location: { lat: number; lng: number; geohash: string };
  status: Status;
  severity: number;
  createdBy: { uid: string; email?: string | null };
  counts: IssueCounts;
  timeline: { at: any; by: string; status: Status; note: string }[];
}

export async function createIssue(payload: IssuePayload) {
  const createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, "issues"), {
    ...payload,
    createdAt,
    priorityScore: calcPriorityScore({
      category: payload.category,
      severity: payload.severity,
      counts: payload.counts,
      createdAt: new Date(),
      status: payload.status
    })
  });
  return ref.id;
}

export async function updateIssueStatus(issueId: string, status: Status, by: string, note: string) {
  const issueRef = doc(db, "issues", issueId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(issueRef);
    if (!snap.exists()) throw new Error("Issue missing");
    const data = snap.data() as any;
    const counts = data.counts as IssueCounts;
    const priorityScore = calcPriorityScore({
      category: data.category,
      severity: data.severity,
      counts,
      createdAt: data.createdAt,
      status
    });
    const timeline = [...(data.timeline || []), { at: serverTimestamp(), by, status, note }];
    tx.update(issueRef, { status, timeline, priorityScore });
  });
}

export async function upsertConfirmation(issueId: string, uid: string, type: "STILL_THERE" | "CLEANED") {
  const issueRef = doc(db, "issues", issueId);
  const confRef = doc(db, "issues", issueId, "confirmations", uid);
  await runTransaction(db, async (tx) => {
    const issueSnap = await tx.get(issueRef);
    if (!issueSnap.exists()) throw new Error("Issue missing");
    const issue = issueSnap.data() as any;
    const counts: IssueCounts = { ...(issue.counts || { stillThere: 0, cleaned: 0 }) };
    const existing = await tx.get(confRef);
    if (existing.exists()) {
      const prev = existing.data().type;
      if (prev === type) return; // already counted
      if (prev === "STILL_THERE") counts.stillThere -= 1;
      if (prev === "CLEANED") counts.cleaned -= 1;
    }
    if (type === "STILL_THERE") counts.stillThere += 1;
    if (type === "CLEANED") counts.cleaned += 1;

    const priorityScore = calcPriorityScore({
      category: issue.category,
      severity: issue.severity,
      counts,
      createdAt: issue.createdAt,
      status: issue.status
    });

    tx.set(confRef, { type, at: serverTimestamp() });
    tx.update(issueRef, { counts, priorityScore });
  });
}
