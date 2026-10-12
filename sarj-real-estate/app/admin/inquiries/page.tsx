import { Suspense } from "react";
import { InquiriesPage } from "@/features/intelligence/components/records";
export const metadata={title:"Investor inquiries"};
export default function Page(){return <Suspense fallback={<div className="bi-skeleton" style={{height:400}}/>}><InquiriesPage/></Suspense>;}
