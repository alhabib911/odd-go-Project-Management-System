"use client";

import { useEffect } from "react";
import { migrateLegacyStorage } from "@/lib/storage-migration";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  return children;
}
