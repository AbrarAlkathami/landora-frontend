import { Suspense } from "react";
import { DemandPage } from "@/features/intelligence/components/demand";
export const metadata={title:"Demand & inventory"};
export default function Page(){return <Suspense fallback={<div className="bi-skeleton" style={{height:400}}/>}><DemandPage/></Suspense>;}
