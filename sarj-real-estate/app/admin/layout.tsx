import { AdminExperience } from "@/features/intelligence/components/shell";
import "./admin.css";
export const metadata = { title: "Leadership intelligence" };
export default function AdminLayout({children}:{children:React.ReactNode}) {return <AdminExperience>{children}</AdminExperience>;}
