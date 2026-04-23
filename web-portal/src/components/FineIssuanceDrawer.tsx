"use client";

import { useState } from "react";

interface FineIssuanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clipId: string;
  onSubmit: (data: FineFormData) => void;
  isLoading?: boolean;
}

interface FineFormData {
  license_plate: string;
  violation_type: string;
  fine_amount: number;
  notes: string;
}

const FINE_TIERS = [
  { type: "LANE_CHANGE_NO_SIGNAL", label: "Lane change without signal", amount: 500 },
  { type: "UNSAFE_LANE_CHANGE", label: "Unsafe lane change", amount: 1000 },
  { type: "RECKLESS_LANE_WEAVING", label: "Reckless lane weaving", amount: 2000 },
];

export default function FineIssuanceDrawer({ isOpen, onClose, clipId, onSubmit, isLoading = false }: FineIssuanceDrawerProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedTier, setSelectedTier] = useState(FINE_TIERS[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) return;
    onSubmit({
      license_plate: licensePlate.toUpperCase(),
      violation_type: selectedTier.type,
      fine_amount: selectedTier.amount,
      notes,
    });
    setLicensePlate("");
    setNotes("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[480px] z-50 animate-slide-in-right"
        style={{
          background: "var(--cloud-white)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--pale-gray)" }}>
            <div>
              <h2 className="heading-lg">Issue Fine</h2>
              <p className="body-sm mt-1" style={{ color: "var(--ash)" }}>
                Clip: {clipId.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors duration-200"
              style={{ background: "var(--parchment)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {/* License Plate */}
            <div className="mb-6">
              <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
                License Plate
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="DL01AB1234"
                className="input-field font-mono tracking-wider text-lg"
                style={{ letterSpacing: "2px" }}
                required
              />
              <p className="body-sm mt-1" style={{ color: "var(--ash)" }}>
                Enter exactly as visible in the clip footage
              </p>
            </div>

            {/* Violation Type / Fine Tier */}
            <div className="mb-6">
              <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
                Violation Type
              </label>
              <div className="flex flex-col gap-2">
                {FINE_TIERS.map((tier) => (
                  <label
                    key={tier.type}
                    className="flex items-center justify-between p-4 rounded-[12px] cursor-pointer transition-all duration-200"
                    style={{
                      background: selectedTier.type === tier.type ? "rgba(168, 85, 247, 0.08)" : "var(--parchment)",
                      border: selectedTier.type === tier.type ? "1.5px solid var(--electric-lavender)" : "1.5px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="fine-tier"
                        value={tier.type}
                        checked={selectedTier.type === tier.type}
                        onChange={() => setSelectedTier(tier)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: selectedTier.type === tier.type ? "var(--electric-lavender)" : "var(--muted-stone)",
                        }}
                      >
                        {selectedTier.type === tier.type && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--electric-lavender)" }} />
                        )}
                      </div>
                      <span className="body-md" style={{ color: "var(--charcoal)" }}>
                        {tier.label}
                      </span>
                    </div>
                    <span className="heading-sm" style={{ color: "var(--ink)" }}>
                      ₹{tier.amount}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
                Officer Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details about the violation..."
                className="input-field"
                style={{ height: "100px", paddingTop: "12px", resize: "vertical" }}
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-[16px] mb-6" style={{ background: "var(--soft-beige)" }}>
              <p className="label-md mb-2" style={{ color: "var(--ash)" }}>Fine Summary</p>
              <div className="flex justify-between items-center">
                <span className="body-md" style={{ color: "var(--charcoal)" }}>
                  {selectedTier.label}
                </span>
                <span className="heading-lg gradient-text">₹{selectedTier.amount}</span>
              </div>
              {licensePlate && (
                <p className="body-sm mt-2 font-mono" style={{ color: "var(--charcoal)" }}>
                  Plate: {licensePlate}
                </p>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t" style={{ borderColor: "var(--pale-gray)" }}>
            <button
              onClick={handleSubmit as () => void}
              disabled={!licensePlate.trim() || isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Issue Fine — ₹{selectedTier.amount}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
