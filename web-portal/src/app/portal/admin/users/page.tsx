"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { getAllUsers } from "@/services/api";
import { User } from "@/stores/auth-store";

function RoleBadge({ role }: { role: User["role"] }) {
  const config: Record<User["role"], { class: string }> = {
    DRIVER: { class: "badge-peach" },
    REVIEWER: { class: "badge-lavender" },
    OFFICER: { class: "badge-warning" },
    ADMIN: { class: "badge-info" },
  };
  return (
    <span className={`badge ${config[role].class}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

export default function UserManagementPage() {
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  // Local state for optimistic updates during edit/toggle
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  useMemo(() => {
    if (usersData.length > 0) {
      setLocalUsers(usersData);
    }
  }, [usersData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const filteredUsers = localUsers.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleActive = (userId: string) => {
    // In production, this would trigger a mutation to update user strictly on backend
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );
  };

  return (
    <div>
      <Header
        title="User Management"
        subtitle="Manage portal users and their roles"
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Users", value: localUsers.length, color: "var(--electric-lavender)" },
            { label: "Drivers", value: localUsers.filter((u) => u.role === "DRIVER").length, color: "var(--warm-peach)" },
            { label: "Reviewers", value: localUsers.filter((u) => u.role === "REVIEWER").length, color: "var(--lavender-mist)" },
            { label: "Officers", value: localUsers.filter((u) => u.role === "OFFICER").length, color: "var(--warning)" },
            { label: "Admins", value: localUsers.filter((u) => u.role === "ADMIN").length, color: "var(--info)" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-5 rounded-[16px] animate-fade-in"
              style={{ background: "var(--parchment)", animationDelay: `${i * 60}ms` }}
            >
              <p className="label-md" style={{ color: "var(--ash)" }}>{stat.label}</p>
              <p className="heading-xl mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: "var(--parchment)" }}>
            {["ALL", "DRIVER", "REVIEWER", "OFFICER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className="px-3 py-2 rounded-[12px] transition-all duration-200 body-sm"
                style={{
                  background: filterRole === r ? "white" : "transparent",
                  color: filterRole === r ? "var(--ink)" : "var(--ash)",
                  boxShadow: filterRole === r ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: filterRole === r ? 600 : 400,
                }}
              >
                {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="input-field pl-10"
                style={{ width: "240px", height: "44px" }}
              />
            </div>
            <button className="btn-primary" style={{ height: "44px", minWidth: "auto" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Users grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredUsers.map((user, i) => (
            <div
              key={user.id}
              className="p-5 rounded-[20px] animate-fade-in transition-all duration-200"
              style={{
                background: "var(--parchment)",
                animationDelay: `${i * 60}ms`,
                opacity: user.is_active ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      background: user.is_active
                        ? "linear-gradient(135deg, var(--blossom-pink), var(--lavender-mist))"
                        : "var(--muted-stone)",
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="heading-sm" style={{ color: "var(--ink)" }}>{user.name}</h3>
                    <p className="body-sm" style={{ color: "var(--ash)" }}>{user.email}</p>
                  </div>
                </div>
                <RoleBadge role={user.role} />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--pale-gray)" }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: user.is_active ? "var(--success)" : "var(--error)" }}
                  />
                  <span className="label-sm" style={{ color: user.is_active ? "var(--success)" : "var(--error)" }}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className="px-3 py-1.5 rounded-[8px] transition-all duration-200 body-sm"
                    style={{
                      background: user.is_active ? "rgba(235,87,87,0.08)" : "rgba(111,207,151,0.08)",
                      color: user.is_active ? "var(--error)" : "var(--success)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-[8px] transition-all duration-200 body-sm"
                    style={{
                      background: "rgba(168,85,247,0.08)",
                      color: "var(--electric-lavender)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="body-md" style={{ color: "var(--ash)" }}>No users match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
