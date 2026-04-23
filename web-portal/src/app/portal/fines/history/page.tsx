"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { formatDate, formatTime } from "@/lib/utils";
import { getFinesHistory, Fine } from "@/services/api";

function FineStatusBadge({ status }: { status: Fine["status"] }) {
  const config: Record<Fine["status"], { class: string; label: string }> = {
    ISSUED: { class: "badge-warning", label: "Issued" },
    PAID: { class: "badge-success", label: "Paid" },
    CANCELLED: { class: "badge-error", label: "Cancelled" },
    DISPUTED: { class: "badge-info", label: "Disputed" },
  };
  const c = config[status];
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}

export default function FinesHistoryPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: finesList = [], isLoading } = useQuery({
    queryKey: ["finesHistory"],
    queryFn: getFinesHistory,
  });

  const filteredFines = finesList.filter((f) => {
    if (filterStatus !== "ALL" && f.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (f.license_plate?.toLowerCase().includes(q) ?? false) ||
        (f.issued_by?.toLowerCase().includes(q) ?? false) ||
        (f.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const totalAmount = finesList.reduce((sum, f) => sum + (f.fine_amount || 0), 0);
  const paidAmount = finesList.filter((f) => f.status === "PAID").reduce((sum, f) => sum + (f.fine_amount || 0), 0);

  if (isLoading) {
    return (
      <div>
        <Header title="Fines History" subtitle="Track all issued fines and their current status" />
        <div className="p-16 flex justify-center">
           <div className="w-8 h-8 border-4 border-t-[var(--electric-lavender)] border-[var(--pale-gray)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Fines History"
        subtitle="Track all issued fines and their current status"
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-[16px] animate-fade-in" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Total Fines</p>
            <p className="heading-xl mt-1" style={{ color: "var(--electric-lavender)" }}>{finesList.length}</p>
          </div>
          <div className="p-5 rounded-[16px] animate-fade-in stagger-1" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Total Value</p>
            <p className="heading-xl mt-1 gradient-text">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-[16px] animate-fade-in stagger-2" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Collected</p>
            <p className="heading-xl mt-1" style={{ color: "var(--success)" }}>₹{paidAmount.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-[16px] animate-fade-in stagger-3" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Outstanding</p>
            <p className="heading-xl mt-1" style={{ color: "var(--warning)" }}>₹{(totalAmount - paidAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: "var(--parchment)" }}>
            {["ALL", "ISSUED", "PAID", "CANCELLED", "DISPUTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-2 rounded-[12px] transition-all duration-200 body-sm"
                style={{
                  background: filterStatus === s ? "white" : "transparent",
                  color: filterStatus === s ? "var(--ink)" : "var(--ash)",
                  boxShadow: filterStatus === s ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: filterStatus === s ? 600 : 400,
                }}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plate, officer..."
              className="input-field pl-10"
              style={{ width: "260px", height: "44px" }}
            />
          </div>
        </div>

        {/* Fines table */}
        <div className="rounded-[20px] overflow-hidden" style={{ background: "var(--parchment)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--muted-stone)" }}>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>License Plate</th>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>Violation</th>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>Amount</th>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>Issued By</th>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>Date</th>
                <th className="text-left label-md p-4" style={{ color: "var(--ash)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((fine, i) => (
                <tr
                  key={fine.id}
                  className="transition-colors duration-150 animate-fade-in"
                  style={{
                    borderBottom: "1px solid var(--pale-gray)",
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,85,247,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="p-4">
                    <span className="heading-sm font-mono" style={{ color: "var(--ink)", letterSpacing: "1px" }}>
                      {fine.license_plate}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="body-sm" style={{ color: "var(--charcoal)" }}>
                      {fine.violation_type?.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ") || "General Violation"}
                    </p>
                    <p className="label-sm truncate max-w-[200px]" style={{ color: "var(--ash)" }}>
                      {fine.notes}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="heading-sm" style={{ color: "var(--ink)" }}>
                      ₹{fine.fine_amount}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="body-sm" style={{ color: "var(--charcoal)" }}>
                      {fine.issued_by?.slice(-6) || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="body-sm" style={{ color: "var(--charcoal)" }}>
                      {fine.issued_at ? formatDate(fine.issued_at) : "N/A"}
                    </p>
                    <p className="label-sm" style={{ color: "var(--ash)" }}>
                      {fine.issued_at ? formatTime(fine.issued_at) : "--:--"}
                    </p>
                  </td>
                  <td className="p-4">
                    <FineStatusBadge status={fine.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFines.length === 0 && (
            <div className="text-center py-12">
              <p className="body-md" style={{ color: "var(--ash)" }}>
                No fines match your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
