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

// ─── Trip ────────────────────────────────────────────────────────────────────

export type TripStatus = "Scheduled" | "In Transit" | "Delivered" | "Cancelled";

export interface Trip {
    id: string;
    vehicleId: string;
    vehicleName: string;
    driverId: string;
    driverName: string;
    origin: string;
    destination: string;
    cargoDescription: string;
    weight: number; // kg
    status: TripStatus;
    scheduledDate: string;
    estimatedArrival: string;
    actualArrival?: string;
    distance: number; // km
    createdAt: string;
}

// ─── Driver ──────────────────────────────────────────────────────────────────

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type LicenseClass = "A" | "B" | "C" | "D" | "E";

export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseClass: LicenseClass;
    licenseExpiry: string;
    status: DriverStatus;
    totalTrips: number;
    safetyScore: number; // 0-100
    region: string;
    joinDate: string;
    vehicleId?: string;
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export type ExpenseCategory = "Fuel" | "Maintenance" | "Insurance" | "Tolls" | "Salary" | "Other";

export interface Expense {
    id: string;
    vehicleId?: string;
    vehicleName?: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    approvedBy?: string;
}

export interface FinanceSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    monthlyTrend: MonthlyData[];
    expensesByCategory: CategoryData[];
}

export interface MonthlyData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKPIs {
    activeFleet: number;
    maintenanceAlerts: number;
    utilizationRate: number;
    pendingCargo: number;
    totalVehicles: number;
    totalDrivers: number;
    totalTripsThisMonth: number;
    revenueThisMonth: number;
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

// ─── Fleet Store ─────────────────────────────────────────────────────────────

export interface FleetState {
    vehicles: Vehicle[];
    filters: VehicleFilters;
    addVehicle: (vehicle: VehicleFormData) => void;
    updateVehicle: (id: string, vehicle: Partial<VehicleFormData>) => void;
    deleteVehicle: (id: string) => void;
    toggleOutOfService: (id: string) => void;
    setFilters: (filters: Partial<VehicleFilters>) => void;
    resetFilters: () => void;
    getFilteredVehicles: () => Vehicle[];
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}
