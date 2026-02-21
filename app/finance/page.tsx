"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFleetStore } from "@/store/useFleetStore";
import { useToast } from "@/components/layout/ToastProvider";
import { Plus, X, Fuel, Truck, Calendar, DollarSign, Droplet, Calculator } from "lucide-react";

export default function FinancePage({ isComponent }: { isComponent?: boolean }) {
    const { vehicles, fuelLogs, serviceLogs, addFuelLog } = useFleetStore();
    const { showToast } = useToast();

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [vehicleId, setVehicleId] = useState("");
    const [liters, setLiters] = useState<number | "">("");
    const [cost, setCost] = useState<number | "">("");
    const [date, setDate] = useState("");

    const activeVehicles = vehicles.filter(v => v.status !== "Retired");

    const isValid = vehicleId && typeof liters === "number" && liters > 0 && typeof cost === "number" && cost >= 0 && date;

    const handleAddFuel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        addFuelLog({
            vehicleId,
            liters: Number(liters),
            cost: Number(cost),
            date,
        });

        const selectedVehicle = vehicles.find(v => v.id === vehicleId);
        showToast("success", "Fuel Logged", `${liters}L of fuel added for ${selectedVehicle?.name || 'Vehicle'}.`);

        setIsFormOpen(false);
        setVehicleId("");
        setLiters("");
        setCost("");
        setDate("");
    };

    const vehicleCosts = useMemo(() => {
        return vehicles.map(v => {
            const vFuelLogs = fuelLogs.filter(fl => fl.vehicleId === v.id);
            const vServiceLogs = serviceLogs.filter(sl => sl.vehicleId === v.id);

            const totalFuelCost = vFuelLogs.reduce((acc, log) => acc + log.cost, 0);
            const totalMaintenanceCost = vServiceLogs.reduce((acc, log) => acc + log.cost, 0);
            const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

            return {
                vehicle: v,
                totalFuelCost,
                totalMaintenanceCost,
                totalOperationalCost,
            };
        }).filter(vc => vc.totalOperationalCost > 0 || vc.vehicle.status !== "Retired")
            .sort((a, b) => b.totalOperationalCost - a.totalOperationalCost);
    }, [vehicles, fuelLogs, serviceLogs]);

    const content = (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Finance & Operations</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Track per-vehicle operational costs and fuel logs.</p>
                </div>
                {!isFormOpen && (
                    <button onClick={() => setIsFormOpen(true)} className="btn-primary shrink-0">
                        <Plus className="w-4 h-4" />
                        Log Fuel
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="card-base p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Fuel className="w-5 h-5 text-primary" />
                            New Fuel Entry
                        </h3>
                        <button onClick={() => setIsFormOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddFuel} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Vehicle */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Vehicle</label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <select
                                        required
                                        value={vehicleId}
                                        onChange={(e) => setVehicleId(e.target.value)}
                                        className="input-base pl-9 w-full appearance-none"
                                    >
                                        <option value="" disabled>Select vehicle...</option>
                                        {activeVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Liters */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Liters</label>
                                <div className="relative">
                                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={liters}
                                        onChange={(e) => setLiters(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="input-base pl-9 w-full"
                                    />
                                </div>
                            </div>
                            {/* Cost */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Cost ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="input-base pl-9 w-full"
                                    />
                                </div>
                            </div>
                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                                    <input
                                        required
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="input-base pl-9 w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm rounded-lg hover:bg-muted font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={!isValid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                                Add Fuel Entry
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card-base overflow-hidden">
                {vehicleCosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Calculator className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No operational data</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">Costs will appear here when fuel or maintenance is logged.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>License Plate</th>
                                    <th>Status</th>
                                    <th className="text-right">Total Fuel Cost</th>
                                    <th className="text-right">Total Maintenance Cost</th>
                                    <th className="text-right">Total Operational Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleCosts.map(({ vehicle, totalFuelCost, totalMaintenanceCost, totalOperationalCost }) => (
                                    <tr key={vehicle.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{vehicle.name}</p>
                                                    <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-medium">{vehicle.licensePlate}</code>
                                        </td>
                                        <td>
                                            <span className="text-xs text-muted-foreground">{vehicle.status}</span>
                                        </td>
                                        <td className="text-right text-sm">${totalFuelCost.toFixed(2)}</td>
                                        <td className="text-right text-sm">${totalMaintenanceCost.toFixed(2)}</td>
                                        <td className="text-right text-sm font-semibold text-foreground">
                                            ${totalOperationalCost.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
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

    return <AppShell pageTitle="Finance & Operations">{content}</AppShell>;
}
