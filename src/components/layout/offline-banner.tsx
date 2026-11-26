"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const update = () => setIsOffline(!navigator.onLine);
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-600/30 bg-amber-600/10 px-4 py-2 text-xs text-amber-600">
      <div className="flex items-center gap-2 font-medium">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Você está offline. Apenas páginas em cache estão disponíveis.</span>
      </div>
      <Link href="/painel/offline" className="font-semibold underline">
        Ver detalhes
      </Link>
    </div>
  );
}
