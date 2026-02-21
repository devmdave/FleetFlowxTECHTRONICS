"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole, AuthState } from "@/types";
import { mockUsers } from "@/lib/mockData";

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: (email: string, password: string, role: UserRole): boolean => {
                const found = mockUsers.find(
                    (u) => u.email === email && u.password === password && u.role === role
                );
                if (found) {
                    const user: User = {
                        id: `usr-${found.role.toLowerCase().replace(" ", "-")}`,
                        name: found.name,
                        email: found.email,
                        role: found.role,
                    };
                    set({ user, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: "fleetflow-auth",
        }
    )
);
