"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import TripCard from "@/components/TripCard";
import { getTripsQueue, Trip } from "@/services/api";

type FilterTab = "ALL" | "PENDING" | "REVIEWED";

export default function TripsQueuePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tripsList = [], isLoading, isError } = useQuery({
    queryKey: ["tripsQueue"],
    queryFn: getTripsQueue,
  });

  const filteredTrips = useMemo(() => {
    let trips = [...tripsList];

    // Filter by tab
    if (activeTab === "PENDING") {
      trips = trips.filter((t) => t.review_status === "PENDING" || t.review_status === "IN_PROGRESS");
    } else if (activeTab === "REVIEWED") {
      trips = trips.filter((t) => t.review_status === "COMPLETED");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      trips = trips.filter(
        (t) =>
          t.user_name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.device_model.toLowerCase().includes(q)
      );
    }

    return trips;
  }, [activeTab, searchQuery]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "All Trips", count: tripsList.length },
    {
      key: "PENDING",
      label: "Pending",
      count: tripsList.filter((t) => t.review_status !== "COMPLETED").length,
    },
    {
      key: "REVIEWED",
      label: "Reviewed",
      count: tripsList.filter((t) => t.review_status === "COMPLETED").length,
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Header title="Trips Queue" subtitle="Review incoming trips and assess violation clips" />
        <div className="p-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-t-[var(--electric-lavender)] border-[var(--pale-gray)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Header title="Trips Queue" subtitle="Review incoming trips and assess violation clips" />
        <div className="p-16 text-center text-[var(--error)]">
          <p>Failed to load trips. Please check your connection to the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Trips Queue"
        subtitle="Review incoming trips and assess violation clips"
      />

      <div className="p-8">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-6">
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: "var(--parchment)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 rounded-[12px] transition-all duration-200"
                style={{
                  background: activeTab === tab.key ? "white" : "transparent",
                  color: activeTab === tab.key ? "var(--ink)" : "var(--ash)",
                  boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-primary)",
                  fontSize: "14px",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}
              >
                {tab.label}
                <span
                  className="ml-2 px-1.5 py-0.5 rounded-md text-xs"
                  style={{
                    background: activeTab === tab.key ? "rgba(168, 85, 247, 0.08)" : "rgba(0,0,0,0.04)",
                    color: activeTab === tab.key ? "var(--electric-lavender)" : "var(--ash)",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ash)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips..."
              className="input-field pl-10"
              style={{ width: "280px", height: "44px" }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Trips",
              value: tripsList.length,
              icon: "📊",
              color: "var(--electric-lavender)",
            },
            {
              label: "Pending Review",
              value: tripsList.filter((t) => t.review_status === "PENDING").length,
              icon: "⏳",
              color: "var(--warning)",
            },
            {
              label: "In Progress",
              value: tripsList.filter((t) => t.review_status === "IN_PROGRESS").length,
              icon: "🔍",
              color: "var(--info)",
            },
            {
              label: "Completed",
              value: tripsList.filter((t) => t.review_status === "COMPLETED").length,
              icon: "✅",
              color: "var(--success)",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-5 rounded-[16px] animate-fade-in"
              style={{
                background: "var(--parchment)",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="label-md" style={{ color: "var(--ash)" }}>
                  {stat.label}
                </span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="heading-xl" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Trip list */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="heading-md mb-2">No trips to show</h3>
              <p className="body-md" style={{ color: "var(--ash)" }}>
                {searchQuery
                  ? "No trips match your search. Try different keywords."
                  : "All caught up. New trips will appear here."}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
