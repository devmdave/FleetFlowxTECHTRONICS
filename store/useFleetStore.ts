"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle, VehicleFormData, VehicleFilters, FleetState, Trip, TripStatus, ServiceLog, FuelLog } from "@/types";
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
            drivers: [
                { id: "d1", name: "Alice Smith", status: "Available", licenseNumber: "LIC-001" },
                { id: "d2", name: "Bob Jones", status: "On Trip", licenseNumber: "LIC-002" },
                { id: "d3", name: "Charlie Doc", status: "Available", licenseNumber: "LIC-003" },
                { id: "d4", name: "Dave Evans", status: "Off Duty", licenseNumber: "LIC-004" },
            ],
            trips: [],
            serviceLogs: [],
            fuelLogs: [],
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

            // New actions
            addTrip: (tripData: Omit<Trip, "id" | "createdAt" | "updatedAt" | "status">) => {
                const newTrip: Trip = {
                    ...tripData,
                    id: `t${Date.now()}`,
                    status: "Draft" as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({ trips: [newTrip, ...state.trips] }));
            },

            updateTripStatus: (id: string, status: TripStatus) => {
                set((state) => ({
                    trips: state.trips.map((t) =>
                        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
                    ),
                    // If changing to "Dispatched", we might want to update vehicle status to "On Trip", but user requirements only say:
                    // "Provide: Status badge display, Status update controls ... Table listing all trips..."
                    // Wait, the requirements don't explicitly ask for vehicle status change when a trip is dispatched. I'll leave as is.
                }));
            },

            addServiceLog: (logData: Omit<ServiceLog, "id" | "status">) => {
                const newLog: ServiceLog = {
                    ...logData,
                    id: `sl${Date.now()}`,
                    status: "Open" as const,
                };
                set((state) => ({
                    serviceLogs: [newLog, ...state.serviceLogs],
                    // "When a vehicle is added to a service log: Automatically update its status to: -> 'In Shop'"
                    vehicles: state.vehicles.map((v) =>
                        v.id === logData.vehicleId ? { ...v, status: "In Shop", updatedAt: new Date().toISOString() } : v
                    ),
                }));
            },

            completeServiceLog: (id: string) => {
                set((state) => {
                    const log = state.serviceLogs.find((l) => l.id === id);
                    if (!log) return state;

                    return {
                        serviceLogs: state.serviceLogs.map((l) =>
                            l.id === id ? { ...l, status: "Completed" as const } : l
                        ),
                        // "When service is marked completed: Change vehicle status back to: -> 'Active'"
                        vehicles: state.vehicles.map((v) =>
                            v.id === log.vehicleId ? { ...v, status: "Active", updatedAt: new Date().toISOString() } : v
                        ),
                    };
                });
            },

            addFuelLog: (logData: Omit<FuelLog, "id">) => {
                const newLog: FuelLog = {
                    ...logData,
                    id: `fl${Date.now()}`,
                };
                set((state) => ({ fuelLogs: [newLog, ...state.fuelLogs] }));
            },
        }),
        {
            name: "fleetflow-fleet",
        }
    )
);
