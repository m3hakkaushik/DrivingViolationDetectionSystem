"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const success = await login(cleanEmail, password);
    if (success) {
      router.push("/portal/trips");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, var(--cloud-white) 0%, var(--soft-beige) 50%, var(--parchment) 100%)",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="fixed top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(244,167,195,0.25) 0%, rgba(201,184,240,0.15) 55%, transparent 100%)",
        }}
      />
      <div
        className="fixed bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(201,184,240,0.2) 0%, rgba(247,201,168,0.1) 55%, transparent 100%)",
          animationDelay: "2s",
        }}
      />

      <div className="w-full max-w-[420px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 mx-auto rounded-[20px] flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(135deg, var(--blossom-pink), var(--lavender-mist))",
              boxShadow: "0 8px 32px rgba(244, 167, 195, 0.4)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="display-lg mb-2">Welcome back</h1>
          <p className="body-md" style={{ color: "var(--ash)" }}>
            Sign in to the Drishti-Path review portal
          </p>
        </div>

        {/* Login Form */}
        <div
          className="p-8 rounded-[24px]"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 40px rgba(212,207,201,0.25)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div
                className="p-4 rounded-[12px] mb-6 flex items-center gap-3 animate-fade-in"
                style={{ background: "rgba(235, 87, 87, 0.08)", border: "1px solid rgba(235, 87, 87, 0.2)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
                </svg>
                <p className="body-sm" style={{ color: "var(--error)" }}>{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="you@example.com"
                className="input-field"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Enter your password"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ash)" }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="body-sm"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--electric-lavender)" }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--pale-gray)" }}>
            <p className="body-sm text-center" style={{ color: "var(--ash)" }}>
              Use any email from mock data to sign in.
              <br />
              Try <strong style={{ color: "var(--charcoal)" }}>palak@example.com</strong> (Reviewer),{" "}
              <strong style={{ color: "var(--charcoal)" }}>shivam@example.com</strong> (Officer), or{" "}
              <strong style={{ color: "var(--charcoal)" }}>tushar@example.com</strong> (Admin).
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="body-sm text-center mt-8" style={{ color: "var(--ash)" }}>
          Drishti-Path · See the road clearly.
        </p>
      </div>
    </div>
  );
}
