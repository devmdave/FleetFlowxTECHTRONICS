"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle, VehicleFormData, VehicleFilters, FleetState } from "@/types";
import { mockVehicles } from "@/lib/mockData";

const DEFAULT_FILTERS: VehicleFilters = {
    search: "",
    status: "All",
    type: "All",
    region: "",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    pageSize: 10,
};

export const useFleetStore = create<FleetState>()(
    persist(
        (set, get) => ({
            vehicles: mockVehicles,
            filters: DEFAULT_FILTERS,

            addVehicle: (formData: VehicleFormData) => {
                const newVehicle: Vehicle = {
                    ...formData,
                    id: `v${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({ vehicles: [newVehicle, ...state.vehicles] }));
            },

            updateVehicle: (id: string, updates: Partial<VehicleFormData>) => {
                set((state) => ({
                    vehicles: state.vehicles.map((v) =>
                        v.id === id
                            ? { ...v, ...updates, updatedAt: new Date().toISOString() }
                            : v
                    ),
                }));
            },

            deleteVehicle: (id: string) => {
                set((state) => ({
                    vehicles: state.vehicles.filter((v) => v.id !== id),
                }));
            },

            toggleOutOfService: (id: string) => {
                set((state) => ({
                    vehicles: state.vehicles.map((v) =>
                        v.id === id
                            ? {
                                ...v,
                                status: v.status === "Retired" ? "Active" : "Retired",
                                updatedAt: new Date().toISOString(),
                            }
                            : v
                    ),
                }));
            },

            setFilters: (filters: Partial<VehicleFilters>) => {
                set((state) => ({
                    filters: { ...state.filters, ...filters, page: 1 },
                }));
            },

            resetFilters: () => {
                set({ filters: DEFAULT_FILTERS });
            },

            getFilteredVehicles: () => {
                const { vehicles, filters } = get();
                let result = [...vehicles];

                // Filter by search
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    result = result.filter(
                        (v) =>
                            v.name.toLowerCase().includes(q) ||
                            v.model.toLowerCase().includes(q) ||
                            v.licensePlate.toLowerCase().includes(q) ||
                            v.driver?.toLowerCase().includes(q)
                    );
                }

                // Filter by status
                if (filters.status !== "All") {
                    result = result.filter((v) => v.status === filters.status);
                }

                // Filter by type
                if (filters.type !== "All") {
                    result = result.filter((v) => v.type === filters.type);
                }

                // Filter by region
                if (filters.region) {
                    result = result.filter((v) =>
                        v.region.toLowerCase().includes(filters.region.toLowerCase())
                    );
                }

                // Sort
                result.sort((a, b) => {
                    let comparison = 0;
                    switch (filters.sortBy) {
                        case "odometer":
                            comparison = a.odometer - b.odometer;
                            break;
                        case "name":
                            comparison = a.name.localeCompare(b.name);
                            break;
                        case "year":
                            comparison = a.year - b.year;
                            break;
                        case "status":
                            comparison = a.status.localeCompare(b.status);
                            break;
                    }
                    return filters.sortOrder === "asc" ? comparison : -comparison;
                });

                return result;
            },
        }),
        {
            name: "fleetflow-fleet",
        }
    )
);
