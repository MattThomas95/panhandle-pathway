"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AdminApp = dynamic(() => import("@/components/AdminApp"), {
  ssr: false,
  loading: () => <div style={{ padding: 20 }}>Loading admin...</div>,
});

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ padding: 20 }}>Initializing...</div>;
  }

  return <AdminApp />;
}
