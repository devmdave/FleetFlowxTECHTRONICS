"use client";

import { useState, useEffect } from "react";
import type { Vehicle, VehicleFormData, VehicleType, FuelType } from "@/types";
import { cn } from "@/lib/utils";
import { X, Loader2 } from "lucide-react";

const VEHICLE_TYPES: VehicleType[] = ["Truck", "Van", "Sedan", "SUV", "Bus", "Motorcycle"];
const FUEL_TYPES: FuelType[] = ["Diesel", "Petrol", "Electric", "Hybrid"];
const REGIONS = ["North", "South", "East", "West", "Central"];

interface VehicleModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: VehicleFormData) => void;
    initialData?: Vehicle;
    mode: "add" | "edit";
}

const emptyForm: VehicleFormData = {
    name: "",
    model: "",
    licensePlate: "",
    type: "Truck",
    status: "Active",
    maxLoadCapacity: 5000,
    odometer: 0,
    fuelType: "Diesel",
    year: new Date().getFullYear(),
    driver: "",
    region: "North",
    lastService: new Date().toISOString().split("T")[0],
    nextServiceDue: 10000,
};

export function VehicleModal({ open, onClose, onSubmit, initialData, mode }: VehicleModalProps) {
    const [form, setForm] = useState<VehicleFormData>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                setForm({
                    name: initialData.name,
                    model: initialData.model,
                    licensePlate: initialData.licensePlate,
                    type: initialData.type,
                    status: initialData.status,
                    maxLoadCapacity: initialData.maxLoadCapacity,
                    odometer: initialData.odometer,
                    fuelType: initialData.fuelType,
                    year: initialData.year,
                    driver: initialData.driver || "",
                    region: initialData.region,
                    lastService: initialData.lastService,
                    nextServiceDue: initialData.nextServiceDue,
                });
            } else {
                setForm(emptyForm);
            }
            setErrors({});
        }
    }, [open, mode, initialData]);

    const set = (key: keyof VehicleFormData, value: string | number) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const validate = (): boolean => {
        const errs: Partial<Record<keyof VehicleFormData, string>> = {};
        if (!form.name.trim()) errs.name = "Vehicle name is required";
        if (!form.model.trim()) errs.model = "Model is required";
        if (!form.licensePlate.trim()) errs.licensePlate = "License plate is required";
        if (form.maxLoadCapacity <= 0) errs.maxLoadCapacity = "Must be > 0";
        if (form.year < 1990 || form.year > new Date().getFullYear() + 1) errs.year = "Invalid year";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        onSubmit(form);
        setLoading(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <div>
                        <h2 className="font-semibold text-lg text-foreground">
                            {mode === "add" ? "Add New Vehicle" : "Edit Vehicle"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {mode === "add" ? "Register a new fleet asset" : `Editing ${initialData?.name}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-1 px-6 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Name *</label>
                            <input
                                id="vehicle-name"
                                className={cn("input-base", errors.name && "border-destructive focus-visible:ring-destructive")}
                                placeholder="e.g. Volvo FH16"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Model *</label>
                            <input
                                id="vehicle-model"
                                className={cn("input-base", errors.model && "border-destructive focus-visible:ring-destructive")}
                                placeholder="e.g. FH16 750"
                                value={form.model}
                                onChange={(e) => set("model", e.target.value)}
                            />
                            {errors.model && <p className="text-xs text-destructive mt-1">{errors.model}</p>}
                        </div>

                        {/* License Plate */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">License Plate *</label>
                            <input
                                id="vehicle-plate"
                                className={cn("input-base font-mono uppercase", errors.licensePlate && "border-destructive")}
                                placeholder="TRK-001-AX"
                                value={form.licensePlate}
                                onChange={(e) => set("licensePlate", e.target.value.toUpperCase())}
                            />
                            {errors.licensePlate && <p className="text-xs text-destructive mt-1">{errors.licensePlate}</p>}
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Year *</label>
                            <input
                                id="vehicle-year"
                                type="number"
                                className={cn("input-base", errors.year && "border-destructive")}
                                min={1990}
                                max={new Date().getFullYear() + 1}
                                value={form.year}
                                onChange={(e) => set("year", parseInt(e.target.value))}
                            />
                            {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Type</label>
                            <select
                                id="vehicle-type"
                                className="input-base cursor-pointer"
                                value={form.type}
                                onChange={(e) => set("type", e.target.value)}
                            >
                                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Fuel Type</label>
                            <select
                                id="vehicle-fuel"
                                className="input-base cursor-pointer"
                                value={form.fuelType}
                                onChange={(e) => set("fuelType", e.target.value)}
                            >
                                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                            <select
                                id="vehicle-status"
                                className="input-base cursor-pointer"
                                value={form.status}
                                onChange={(e) => set("status", e.target.value)}
                            >
                                {["Active", "On Trip", "In Shop", "Retired"].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Region</label>
                            <select
                                id="vehicle-region"
                                className="input-base cursor-pointer"
                                value={form.region}
                                onChange={(e) => set("region", e.target.value)}
                            >
                                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* Max Load Capacity */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Max Load (kg) *</label>
                            <input
                                id="vehicle-capacity"
                                type="number"
                                className={cn("input-base", errors.maxLoadCapacity && "border-destructive")}
                                min={1}
                                value={form.maxLoadCapacity}
                                onChange={(e) => set("maxLoadCapacity", parseInt(e.target.value))}
                            />
                            {errors.maxLoadCapacity && <p className="text-xs text-destructive mt-1">{errors.maxLoadCapacity}</p>}
                        </div>

                        {/* Odometer */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Odometer (km)</label>
                            <input
                                id="vehicle-odometer"
                                type="number"
                                className="input-base"
                                min={0}
                                value={form.odometer}
                                onChange={(e) => set("odometer", parseInt(e.target.value))}
                            />
                        </div>

                        {/* Driver */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Assigned Driver</label>
                            <input
                                id="vehicle-driver"
                                className="input-base"
                                placeholder="Driver full name"
                                value={form.driver || ""}
                                onChange={(e) => set("driver", e.target.value)}
                            />
                        </div>

                        {/* Last Service */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Last Service Date</label>
                            <input
                                id="vehicle-last-service"
                                type="date"
                                className="input-base"
                                value={form.lastService}
                                onChange={(e) => set("lastService", e.target.value)}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        id="vehicle-submit-btn"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving…
                            </>
                        ) : mode === "add" ? (
                            "Add Vehicle"
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
