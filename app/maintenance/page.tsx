"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFleetStore } from "@/store/useFleetStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/layout/ToastProvider";
import { cn } from "@/lib/utils";
import type { ServiceType } from "@/types";
import { Plus, X, Wrench, Truck, PenTool, Calendar, DollarSign } from "lucide-react";

export default function MaintenancePage({ isComponent }: { isComponent?: boolean }) {
    const { vehicles, serviceLogs, addServiceLog, completeServiceLog } = useFleetStore();
    const { showToast } = useToast();
    const user = useAuthStore((s) => s.user);

    const canManageService = user?.role === "Manager";

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [vehicleId, setVehicleId] = useState("");
    const [serviceType, setServiceType] = useState<ServiceType>("Preventive");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState<number | "">("");
    const [date, setDate] = useState("");

    const activeVehicles = vehicles.filter(v => v.status !== "Retired");

    const isValid = vehicleId && description && typeof cost === "number" && cost >= 0 && date;

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        addServiceLog({
            vehicleId,
            serviceType,
            description,
            cost: Number(cost),
            date,
        });

        const selectedVehicle = vehicles.find(v => v.id === vehicleId);
        showToast("warning", "Maintenance Logged", `${selectedVehicle?.name || 'Vehicle'} has been moved to "In Shop".`);

        setIsFormOpen(false);
        setVehicleId("");
        setServiceType("Preventive");
        setDescription("");
        setCost("");
        setDate("");
    };

    const handleComplete = (id: string, vehicleId: string) => {
        completeServiceLog(id);
        const v = vehicles.find(v => v.id === vehicleId);
        showToast("success", "Service Completed", `${v?.name || 'Vehicle'} is now Active and ready for dispatch.`);
    };

    const content = (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Maintenance & Service</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Track vehicle servicing and maintenance logs.</p>
                </div>
                {canManageService && !isFormOpen && (
                    <button onClick={() => setIsFormOpen(true)} className="btn-primary shrink-0">
                        <Plus className="w-4 h-4" />
                        Log Service
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="card-base p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-primary" />
                            New Service Log
                        </h3>
                        <button onClick={() => setIsFormOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddLog} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <option key={v.id} value={v.id}>{v.name} ({v.status})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Service Type */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Service Type</label>
                                <div className="relative">
                                    <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <select
                                        value={serviceType}
                                        onChange={(e) => setServiceType(e.target.value as ServiceType)}
                                        className="input-base pl-9 w-full appearance-none"
                                    >
                                        <option value="Preventive">Preventive</option>
                                        <option value="Repair">Repair</option>
                                    </select>
                                </div>
                            </div>
                            {/* Description */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Details of the service..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-base w-full py-2"
                                />
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
                                Add Log
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card-base overflow-hidden">
                {serviceLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Wrench className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No service logs</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">Record maintenance activities here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Log ID</th>
                                    <th>Vehicle</th>
                                    <th>Service Type</th>
                                    <th>Date</th>
                                    <th>Cost</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceLogs.map((log) => {
                                    const v = vehicles.find(vh => vh.id === log.vehicleId);
                                    return (
                                        <tr key={log.id}>
                                            <td className="font-mono text-sm">{log.id}</td>
                                            <td className="text-sm">{v ? v.name : "Unknown"}</td>
                                            <td className="text-sm">{log.serviceType}</td>
                                            <td className="text-sm">{log.date}</td>
                                            <td className="text-sm font-medium">${log.cost.toFixed(2)}</td>
                                            <td>
                                                <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full",
                                                    log.status === "Open"
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                )}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end">
                                                    {log.status === "Open" ? (
                                                        canManageService ? (
                                                            <button
                                                                onClick={() => handleComplete(log.id, log.vehicleId)}
                                                                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-colors font-medium border border-emerald-200 dark:border-emerald-800"
                                                            >
                                                                Mark Completed
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-amber-600 font-medium">Pending</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Done</span>
                                                    )}
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

    return <AppShell pageTitle="Maintenance & Service" requiredRoles={["Manager", "Financial Analyst"]}>{content}</AppShell>;
}
