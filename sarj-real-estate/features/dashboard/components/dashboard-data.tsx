import { getDashboardStats } from "../api/dashboard";
import { DashboardStats } from "./dashboard-stats";

export async function DashboardData() {
  const stats = await getDashboardStats();

  return (
    <DashboardStats
      totalParcels={stats.total_parcels}
      availableParcels={stats.available_parcels}
      totalInquiries={stats.total_inquiries}
    />
  );
}