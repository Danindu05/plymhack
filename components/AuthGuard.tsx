"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setReady(true);
      if (!user) {
        const redirect = params ? `?redirect=${encodeURIComponent(params.toString() ? window.location.pathname + "?" + params.toString() : window.location.pathname)}` : "";
        router.replace(`/login${redirect}`);
      }
    });
    return () => unsub();
  }, [router, params]);

  if (!ready) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}
