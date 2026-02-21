"use client";

import { useState } from "react";
import type { Vehicle } from "@/types";
import { cn } from "@/lib/utils";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmProps {
    open: boolean;
    vehicle: Vehicle | null;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteConfirm({ open, vehicle, onConfirm, onClose }: DeleteConfirmProps) {
    const [confirmed, setConfirmed] = useState("");

    if (!open || !vehicle) return null;

    const handleConfirm = () => {
        onConfirm();
        setConfirmed("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-center text-foreground mb-1">Delete Vehicle</h3>
                <p className="text-sm text-muted-foreground text-center mb-1">
                    You are about to permanently delete:
                </p>
                <p className="text-sm font-semibold text-center text-foreground mb-4">
                    {vehicle.name} · {vehicle.licensePlate}
                </p>
                <p className="text-xs text-muted-foreground text-center mb-4">
                    This action cannot be undone. Type <code className="font-mono bg-muted px-1 rounded">DELETE</code> to confirm.
                </p>
                <input
                    id="delete-confirm-input"
                    className="input-base mb-4 text-center font-mono"
                    placeholder="Type DELETE"
                    value={confirmed}
                    onChange={(e) => setConfirmed(e.target.value)}
                />
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        id="delete-confirm-btn"
                        type="button"
                        onClick={handleConfirm}
                        disabled={confirmed !== "DELETE"}
                        className={cn("btn-destructive flex-1", confirmed !== "DELETE" && "opacity-40 cursor-not-allowed")}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
