import { Suspense } from "react";
import { ParcelsPage } from "@/features/intelligence/components/records";
export const metadata={title:"Land portfolio"};
export default function Page(){return <Suspense fallback={<div className="bi-skeleton" style={{height:400}}/>}><ParcelsPage/></Suspense>;}
