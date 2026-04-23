"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => pathname.startsWith(path);

  const reviewerLinks = [
    {
      href: "/portal/trips",
      label: "Trips Queue",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
          <circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" />
        </svg>
      ),
    },
  ];

  const officerLinks = [
    {
      href: "/portal/fines/queue",
      label: "Fine Queue",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
    },
    {
      href: "/portal/fines/history",
      label: "Fines History",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const adminLinks = [
    {
      href: "/portal/admin/users",
      label: "User Management",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  // Determine which links to show based on role
  const getNavLinks = () => {
    if (!user) return [...reviewerLinks, ...officerLinks, ...adminLinks];
    switch (user.role) {
      case "REVIEWER": return [...reviewerLinks];
      case "OFFICER": return [...officerLinks];
      case "ADMIN": return [...reviewerLinks, ...officerLinks, ...adminLinks];
      default: return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: "260px",
        background: "var(--cloud-white)",
        borderRight: "1px solid var(--pale-gray)",
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/portal/trips" className="flex items-center gap-3 no-underline">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--blossom-pink), var(--lavender-mist))",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <h1 className="heading-sm" style={{ color: "var(--ink)", fontSize: "16px" }}>
              Drishti-Path
            </h1>
            <p className="label-sm" style={{ color: "var(--ash)" }}>Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <p className="label-sm px-3 mb-2" style={{ color: "var(--ash)", textTransform: "uppercase" }}>
          Navigation
        </p>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] mb-1 no-underline transition-all duration-200"
            style={{
              background: isActive(link.href) ? "rgba(168, 85, 247, 0.08)" : "transparent",
              color: isActive(link.href) ? "var(--electric-lavender)" : "var(--charcoal)",
            }}
          >
            <span style={{ opacity: isActive(link.href) ? 1 : 0.6 }}>{link.icon}</span>
            <span className={`body-md ${isActive(link.href) ? "font-semibold" : ""}`}>
              {link.label}
            </span>
            {isActive(link.href) && (
              <div
                className="absolute left-0 w-[3px] h-6 rounded-r-full"
                style={{ background: "var(--electric-lavender)" }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Logout + User section at bottom */}
      <div className="p-3">
        {user && (
          <div
            className="p-4 rounded-[16px] mb-2"
            style={{ background: "var(--parchment)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--blossom-pink), var(--lavender-mist))",
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="body-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                  {user.name}
                </p>
                <p className="label-sm" style={{ color: "var(--ash)" }}>
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all duration-200 no-underline"
          style={{
            background: "transparent",
            color: "var(--error)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-primary)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="body-sm" style={{ fontWeight: 500 }}>Log out</span>
        </button>
      </div>
    </aside>
  );
}
