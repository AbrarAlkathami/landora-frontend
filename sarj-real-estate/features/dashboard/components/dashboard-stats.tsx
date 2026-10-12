import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  type DashboardStatsProps = {
    totalParcels: number;
    availableParcels: number;
    totalInquiries: number;
  };
  
  export function DashboardStats({
    totalParcels,
    availableParcels,
    totalInquiries,
  }: DashboardStatsProps) {
    const stats = [
      {
        title: "Total Parcels",
        value: totalParcels,
      },
      {
        title: "Available Parcels",
        value: availableParcels,
      },
      {
        title: "Investor Inquiries",
        value: totalInquiries,
      },
    ];
  
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
  
            <CardContent>
              <p className="text-3xl font-semibold">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }