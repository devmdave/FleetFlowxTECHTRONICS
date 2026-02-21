"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VehicleModal } from "@/components/vehicles/VehicleModal";
import { DeleteConfirm } from "@/components/vehicles/DeleteConfirm";
import { useFleetStore } from "@/store/useFleetStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/layout/ToastProvider";
import {
    getVehicleStatusColor,
    formatNumber,
    formatDate,
    cn,
} from "@/lib/utils";
import type { Vehicle, VehicleFormData, VehicleStatus, VehicleType } from "@/types";
import {
    Plus,
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    PowerOff,
    Power,
    Truck,
    SortAsc,
    SortDesc,
    X,
    Gauge,
    Weight,
    Calendar,
} from "lucide-react";

const STATUSES: (VehicleStatus | "All")[] = ["All", "Active", "On Trip", "In Shop", "Retired"];
const TYPES: (VehicleType | "All")[] = ["All", "Truck", "Van", "Sedan", "SUV", "Bus", "Motorcycle"];

export default function VehiclesPage({ isComponent }: { isComponent?: boolean }) {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle, toggleOutOfService } = useFleetStore();
    const user = useAuthStore((s) => s.user);
    const { showToast } = useToast();

    const canAdd = user?.role === "Manager";
    const canEdit = user?.role === "Manager" || user?.role === "Dispatcher";
    const canDelete = user?.role === "Manager";
    const canToggleService = user?.role === "Manager";
    const isReadOnly = user?.role === "Financial Analyst";

    // Local filter state
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<VehicleStatus | "All">("All");
    const [typeFilter, setTypeFilter] = useState<VehicleType | "All">("All");
    const [sortBy, setSortBy] = useState<"odometer" | "name" | "year" | "status">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 8;

    // Modal state
    const [addOpen, setAddOpen] = useState(false);
    const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

    const filtered = useMemo(() => {
        let data = [...vehicles];
        if (search) {
            const q = search.toLowerCase();
            data = data.filter(
                (v) =>
                    v.name.toLowerCase().includes(q) ||
                    v.model.toLowerCase().includes(q) ||
                    v.licensePlate.toLowerCase().includes(q) ||
                    v.driver?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "All") data = data.filter((v) => v.status === statusFilter);
        if (typeFilter !== "All") data = data.filter((v) => v.type === typeFilter);
        data.sort((a, b) => {
            let cmp = 0;
            if (sortBy === "odometer") cmp = a.odometer - b.odometer;
            else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
            else if (sortBy === "year") cmp = a.year - b.year;
            else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
            return sortOrder === "asc" ? cmp : -cmp;
        });
        return data;
    }, [vehicles, search, statusFilter, typeFilter, sortBy, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSort = (col: "odometer" | "name" | "year" | "status") => {
        if (sortBy === col) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        else { setSortBy(col); setSortOrder("asc"); }
        setPage(1);
    };

    const SortIcon = ({ col }: { col: string }) =>
        sortBy === col ? (
            sortOrder === "asc" ? <SortAsc className="w-3.5 h-3.5 text-primary" /> : <SortDesc className="w-3.5 h-3.5 text-primary" />
        ) : (
            <SortAsc className="w-3.5 h-3.5 opacity-30" />
        );

    const handleAdd = (data: VehicleFormData) => {
        addVehicle(data);
        showToast("success", "Vehicle added", `${data.name} has been registered.`);
    };

    const handleEdit = (data: VehicleFormData) => {
        if (!editVehicle) return;
        updateVehicle(editVehicle.id, data);
        showToast("success", "Vehicle updated", `${data.name} has been updated.`);
        setEditVehicle(null);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteVehicle(deleteTarget.id);
        showToast("success", "Vehicle deleted", `${deleteTarget.name} removed from registry.`);
        setDeleteTarget(null);
    };

    const handleToggleService = (v: Vehicle) => {
        toggleOutOfService(v.id);
        const newStatus = v.status === "Retired" ? "Active" : "Retired";
        showToast(
            newStatus === "Retired" ? "warning" : "info",
            `Vehicle ${newStatus === "Retired" ? "retired" : "reactivated"}`,
            `${v.name} is now marked as ${newStatus}.`
        );
    };

    const content = (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Vehicle Registry</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {vehicles.length} total vehicles · {vehicles.filter((v) => v.status === "Active" || v.status === "On Trip").length} operational
                    </p>
                </div>
                {canAdd && (
                    <button
                        id="add-vehicle-btn"
                        onClick={() => setAddOpen(true)}
                        className="btn-primary shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </button>
                )}
            </div>

            {/* Filters row */}
            <div className="card-base p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="vehicle-search"
                            className="input-base pl-9 pr-8"
                            placeholder="Search by name, model, plate, driver…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        {search && (
                            <button
                                onClick={() => { setSearch(""); setPage(1); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            id="vehicle-filter-status"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as VehicleStatus | "All"); setPage(1); }}
                            className="appearance-none input-base pr-8 cursor-pointer min-w-[130px]"
                        >
                            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Type */}
                    <div className="relative">
                        <select
                            id="vehicle-filter-type"
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value as VehicleType | "All"); setPage(1); }}
                            className="appearance-none input-base pr-8 cursor-pointer min-w-[130px]"
                        >
                            {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card-base overflow-hidden">
                {paged.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Truck className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No vehicles found</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {search || statusFilter !== "All" || typeFilter !== "All"
                                ? "Try adjusting your filters or search query."
                                : "Start by adding your first fleet vehicle."}
                        </p>
                        {canAdd && !search && statusFilter === "All" && typeFilter === "All" && (
                            <button onClick={() => setAddOpen(true)} className="btn-primary mt-4">
                                <Plus className="w-4 h-4" /> Add Vehicle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Vehicle <SortIcon col="name" />
                                        </button>
                                    </th>
                                    <th>License Plate</th>
                                    <th>Type</th>
                                    <th>
                                        <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Status <SortIcon col="status" />
                                        </button>
                                    </th>
                                    <th>
                                        <button onClick={() => handleSort("odometer")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Odometer <SortIcon col="odometer" />
                                        </button>
                                    </th>
                                    <th>Capacity</th>
                                    <th>
                                        <button onClick={() => handleSort("year")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            Year <SortIcon col="year" />
                                        </button>
                                    </th>
                                    <th>Driver</th>
                                    <th>Region</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{v.name}</p>
                                                    <p className="text-xs text-muted-foreground">{v.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-medium">{v.licensePlate}</code>
                                        </td>
                                        <td>
                                            <span className="text-sm text-muted-foreground">{v.type}</span>
                                        </td>
                                        <td>
                                            <span className={cn("status-badge", getVehicleStatusColor(v.status))}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                                {v.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{formatNumber(v.odometer)} km</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Weight className="w-3.5 h-3.5" />
                                                {formatNumber(v.maxLoadCapacity)} kg
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {v.year}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-foreground">{v.driver || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                                        </td>
                                        <td>
                                            <span className="text-xs text-muted-foreground">{v.region}</span>
                                        </td>
                                        <td>
                                            {canEdit && (
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Toggle Out of Service */}
                                                    {canToggleService && (
                                                        <button
                                                            onClick={() => handleToggleService(v)}
                                                            title={v.status === "Retired" ? "Reactivate vehicle" : "Mark as retired"}
                                                            className={cn(
                                                                "p-1.5 rounded-lg transition-colors",
                                                                v.status === "Retired"
                                                                    ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-amber-600"
                                                            )}
                                                        >
                                                            {v.status === "Retired" ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                        </button>
                                                    )}

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => setEditVehicle(v)}
                                                        title="Edit vehicle"
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => setDeleteTarget(v)}
                                                            title="Delete vehicle"
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {filtered.length > PAGE_SIZE && (
                    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                            {filtered.length} results
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                                    if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "…" ? (
                                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={cn(
                                                "w-7 h-7 rounded-lg text-sm transition-colors",
                                                page === p
                                                    ? "bg-primary text-primary-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <VehicleModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSubmit={handleAdd}
                mode="add"
            />
            <VehicleModal
                open={!!editVehicle}
                onClose={() => setEditVehicle(null)}
                onSubmit={handleEdit}
                initialData={editVehicle || undefined}
                mode="edit"
            />
            <DeleteConfirm
                open={!!deleteTarget}
                vehicle={deleteTarget}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    );

    if (isComponent) return content;

    return <AppShell pageTitle="Vehicle Registry" requiredRoles={["Manager", "Dispatcher", "Financial Analyst"]}>{content}</AppShell>;
}
