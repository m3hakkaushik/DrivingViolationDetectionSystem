import { create } from "zustand";
import { fetchApi } from "@/lib/api-client";

// Define User locally or import from a shared types file
export interface User {
  id: string;
  name: string;
  email: string;
  role: "DRIVER" | "REVIEWER" | "OFFICER" | "ADMIN";
  is_active: boolean;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetchApi<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      // Mock login fallback for development/demo when backend is down
      // Only triggered for the official mock accounts if they fail to authenticate with real backend
      const mockUsers: Record<string, { name: string; role: User["role"] }> = {
        "palak@example.com": { name: "Palak (Mock Reviewer)", role: "REVIEWER" },
        "shivam@example.com": { name: "Shivam (Mock Officer)", role: "OFFICER" },
        "tushar@example.com": { name: "Tushar (Mock Admin)", role: "ADMIN" },
      };

      if (mockUsers[normalizedEmail] && password === "password123") {
        console.warn(`API unreachable or 401. Using mock login fallback for ${normalizedEmail}`);
        const user = mockUsers[normalizedEmail];
        set({
          user: {
            id: `mock-${normalizedEmail}-id`,
            name: user.name,
            email: normalizedEmail,
            role: user.role,
            is_active: true,
          },
          token: "mock-jwt-token",
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }

      set({ 
        isLoading: false, 
        error: err.data?.detail || "Failed to log in. Please check your credentials." 
      });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
