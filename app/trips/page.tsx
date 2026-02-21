"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFleetStore } from "@/store/useFleetStore";
import { useToast } from "@/components/layout/ToastProvider";
import { cn } from "@/lib/utils";
import type { TripStatus } from "@/types";
import { Plus, X, Package, Truck, User, MapPin, Scale } from "lucide-react";

export default function TripsPage({ isComponent }: { isComponent?: boolean }) {
    const { vehicles, drivers, trips, addTrip, updateTripStatus } = useFleetStore();
    const { showToast } = useToast();

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [vehicleId, setVehicleId] = useState("");
    const [driverId, setDriverId] = useState("");
    const [cargoWeight, setCargoWeight] = useState<number | "">("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    const availableVehicles = vehicles.filter((v) => v.status !== "In Shop" && v.status !== "Retired");
    const availableDrivers = drivers.filter((d) => d.status === "Available");

    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

    const isOverweight = selectedVehicle && typeof cargoWeight === "number" && cargoWeight > selectedVehicle.maxLoadCapacity;
    const isValid = vehicleId && driverId && typeof cargoWeight === "number" && cargoWeight > 0 && origin && destination && !isOverweight;

    const handleCreateTrip = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        addTrip({
            vehicleId,
            driverId,
            cargoWeight: Number(cargoWeight),
            origin,
            destination,
        });

        showToast("success", "Trip Dispatched", `Trip from ${origin} to ${destination} created.`);
        setIsFormOpen(false);
        setVehicleId("");
        setDriverId("");
        setCargoWeight("");
        setOrigin("");
        setDestination("");
    };

    const getStatusColor = (status: TripStatus) => {
        switch (status) {
            case "Draft": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            case "Dispatched": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const content = (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Trip Dispatcher</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage goods movement workflow and dispatching.</p>
                </div>
                {!isFormOpen && (
                    <button onClick={() => setIsFormOpen(true)} className="btn-primary shrink-0">
                        <Plus className="w-4 h-4" />
                        Create Trip
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="card-base p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            New Trip
                        </h3>
                        <button onClick={() => setIsFormOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleCreateTrip} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vehicle */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Available Vehicle</label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <select
                                        required
                                        value={vehicleId}
                                        onChange={(e) => setVehicleId(e.target.value)}
                                        className="input-base pl-9 w-full appearance-none"
                                    >
                                        <option value="" disabled>Select vehicle...</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.maxLoadCapacity}kg cap)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Driver */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Available Driver</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <select
                                        required
                                        value={driverId}
                                        onChange={(e) => setDriverId(e.target.value)}
                                        className="input-base pl-9 w-full appearance-none"
                                    >
                                        <option value="" disabled>Select driver...</option>
                                        {availableDrivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Origin */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Origin</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Starting location"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        className="input-base pl-9 w-full"
                                    />
                                </div>
                            </div>
                            {/* Destination */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ending location"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="input-base pl-9 w-full"
                                    />
                                </div>
                            </div>
                            {/* Cargo Weight */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Cargo Weight (kg)</label>
                                <div className="relative">
                                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        placeholder="0"
                                        value={cargoWeight}
                                        onChange={(e) => setCargoWeight(e.target.value === "" ? "" : Number(e.target.value))}
                                        className={cn("input-base pl-9 w-full", isOverweight ? "border-red-500 focus:ring-red-500" : "")}
                                    />
                                </div>
                                {isOverweight && (
                                    <p className="text-red-500 text-xs mt-1">Exceeds vehicle capacity of {selectedVehicle.maxLoadCapacity}kg</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm rounded-lg hover:bg-muted font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={!isValid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                                Create Trip
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card-base overflow-hidden">
                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No trips yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">Start by dispatching your first trip.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Trip ID</th>
                                    <th>Vehicle</th>
                                    <th>Driver</th>
                                    <th>Route</th>
                                    <th>Cargo</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map((t) => {
                                    const v = vehicles.find(v => v.id === t.vehicleId);
                                    const d = drivers.find(d => d.id === t.driverId);
                                    return (
                                        <tr key={t.id}>
                                            <td className="font-mono text-sm">{t.id}</td>
                                            <td className="text-sm">{v ? v.name : "Unknown"}</td>
                                            <td className="text-sm">{d ? d.name : "Unknown"}</td>
                                            <td className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span>{t.origin}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span>{t.destination}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm">{t.cargoWeight} kg</td>
                                            <td>
                                                <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", getStatusColor(t.status))}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) => updateTripStatus(t.id, e.target.value as TripStatus)}
                                                        className="text-xs bg-muted border border-border rounded px-2 py-1 appearance-none cursor-pointer hover:bg-accent transition-colors"
                                                    >
                                                        <option value="Draft">Draft</option>
                                                        <option value="Dispatched">Dispatched</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );

    if (isComponent) {
        return content;
    }

    return <AppShell pageTitle="Trip Dispatcher">{content}</AppShell>;
}
