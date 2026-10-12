const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export type DashboardStatsResponse = {
  total_parcels: number;
  available_parcels: number;
  total_inquiries: number;
};

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard stats: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}