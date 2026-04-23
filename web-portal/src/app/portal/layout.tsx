"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Sidebar from "@/components/layout/Sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--cloud-white)" }}>
      <Sidebar />
      <main className="flex-1" style={{ marginLeft: "260px" }}>
        {children}
      </main>
    </div>
  );
}
