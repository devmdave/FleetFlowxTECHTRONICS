// ─── Auth & RBAC ────────────────────────────────────────────────────────────

export type UserRole = "Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: UserRole) => boolean;
    logout: () => void;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export type VehicleStatus = "Active" | "On Trip" | "In Shop" | "Retired";
export type VehicleType = "Truck" | "Van" | "Sedan" | "SUV" | "Bus" | "Motorcycle";
export type FuelType = "Diesel" | "Petrol" | "Electric" | "Hybrid";

export interface Vehicle {
    id: string;
    name: string;
    model: string;
    licensePlate: string;
    type: VehicleType;
    status: VehicleStatus;
    maxLoadCapacity: number; // kg
    odometer: number; // km
    fuelType: FuelType;
    year: number;
    driver?: string;
    region: string;
    lastService: string; // ISO date
    nextServiceDue: number; // odometer km
    createdAt: string;
    updatedAt: string;
}

export interface VehicleFormData {
    name: string;
    model: string;
    licensePlate: string;
    type: VehicleType;
    status: VehicleStatus;
    maxLoadCapacity: number;
    odometer: number;
    fuelType: FuelType;
    year: number;
    driver?: string;
    region: string;
    lastService: string;
    nextServiceDue: number;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKPIs {
    activeFleet: number;
    maintenanceAlerts: number;
    utilizationRate: number;
    pendingCargo: number;
    totalVehicles: number;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface VehicleFilters {
    search: string;
    status: VehicleStatus | "All";
    type: VehicleType | "All";
    region: string;
    sortBy: "odometer" | "name" | "year" | "status";
    sortOrder: "asc" | "desc";
    page: number;
    pageSize: number;
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export type DriverStatus = "Available" | "On Trip" | "Off Duty";

export interface Driver {
    id: string;
    name: string;
    status: DriverStatus;
    licenseNumber: string;
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";

export interface Trip {
    id: string;
    vehicleId: string;
    driverId: string; // Refers to Driver.id
    cargoWeight: number;
    origin: string;
    destination: string;
    status: TripStatus;
    createdAt: string;
    updatedAt: string;
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export type ServiceType = "Preventive" | "Repair";

export interface ServiceLog {
    id: string;
    vehicleId: string; // Refers to Vehicle.id
    serviceType: ServiceType;
    description: string;
    cost: number;
    date: string; // ISO string 
    status: "Open" | "Completed";
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export interface FuelLog {
    id: string;
    vehicleId: string; // Refers to Vehicle.id
    liters: number;
    cost: number;
    date: string;
}

// ─── Fleet Store ─────────────────────────────────────────────────────────────

export interface FleetState {
    vehicles: Vehicle[];
    drivers: Driver[];
    trips: Trip[];
    serviceLogs: ServiceLog[];
    fuelLogs: FuelLog[];

    filters: VehicleFilters;
    addVehicle: (vehicle: VehicleFormData) => void;
    updateVehicle: (id: string, vehicle: Partial<VehicleFormData>) => void;
    deleteVehicle: (id: string) => void;
    toggleOutOfService: (id: string) => void;
    setFilters: (filters: Partial<VehicleFilters>) => void;
    resetFilters: () => void;
    getFilteredVehicles: () => Vehicle[];

    // New actions
    addTrip: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt" | "status">) => void;
    updateTripStatus: (id: string, status: TripStatus) => void;

    addServiceLog: (log: Omit<ServiceLog, "id" | "status">) => void;
    completeServiceLog: (id: string) => void;

    addFuelLog: (log: Omit<FuelLog, "id">) => void;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}
