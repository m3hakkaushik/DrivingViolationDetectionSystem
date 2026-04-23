"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-8 py-5"
      style={{
        borderBottom: "1px solid var(--pale-gray)",
        background: "rgba(250, 250, 250, 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div>
        <h1 className="heading-xl">{title}</h1>
        {subtitle && (
          <p className="body-md mt-1" style={{ color: "var(--ash)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-200 relative"
          style={{ background: "var(--parchment)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
            style={{ background: "var(--neon-magenta)", border: "2px solid var(--cloud-white)" }}
          />
        </button>

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
              style={{
                background: "linear-gradient(135deg, var(--blossom-pink), var(--lavender-mist))",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="body-sm font-medium transition-colors duration-200"
              style={{ color: "var(--ash)", background: "none", border: "none", cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
