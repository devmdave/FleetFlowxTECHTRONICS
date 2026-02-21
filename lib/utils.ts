import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { VehicleStatus, DriverStatus, TripStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
    return new Intl.NumberFormat("en-US").format(n);
}

export function formatCurrency(n: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatOdometer(km: number): string {
    return `${formatNumber(km)} km`;
}

export function getVehicleStatusColor(status: VehicleStatus): string {
    switch (status) {
        case "Active":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "On Trip":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "In Shop":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "Retired":
            return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
}

export function getDriverStatusColor(status: DriverStatus): string {
    switch (status) {
        case "Available":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "On Trip":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "Off Duty":
            return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        case "Suspended":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
}

export function getTripStatusColor(status: TripStatus): string {
    switch (status) {
        case "Scheduled":
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        case "In Transit":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "Delivered":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "Cancelled":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
}

export function getSafetyScoreColor(score: number): string {
    if (score >= 95) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 85) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncate(str: string, max: number): string {
    return str.length > max ? str.slice(0, max) + "…" : str;
}
