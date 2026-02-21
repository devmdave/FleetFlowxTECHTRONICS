"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Toast, ToastType } from "@/types";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface ToastContextValue {
    showToast: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

function ToastIcon({ type }: { type: ToastType }) {
    switch (type) {
        case "success": return <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" size={18} />;
        case "error": return <XCircle className="w-4.5 h-4.5 text-red-500" size={18} />;
        case "warning": return <AlertTriangle className="w-4.5 h-4.5 text-amber-500" size={18} />;
        case "info": return <Info className="w-4.5 h-4.5 text-blue-500" size={18} />;
    }
}

function getToastBg(type: ToastType): string {
    switch (type) {
        case "success": return "border-l-emerald-500";
        case "error": return "border-l-red-500";
        case "warning": return "border-l-amber-500";
        case "info": return "border-l-blue-500";
    }
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, description?: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, type, title, description };
        setToasts((prev) => [...prev, toast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div
                className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
                aria-live="polite"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]",
                            "bg-card border border-border border-l-4 rounded-xl shadow-xl px-4 py-3.5",
                            "toast-enter",
                            getToastBg(toast.type)
                        )}
                    >
                        <ToastIcon type={toast.type} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight">{toast.title}</p>
                            {toast.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
