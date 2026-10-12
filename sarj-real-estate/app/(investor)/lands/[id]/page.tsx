import { Suspense } from "react";
import { ParcelPage } from "@/components/investor/parcel-page";
export const metadata = {
  title: "Land opportunity"
};
async function Land({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id
  } = await params;
  return <ParcelPage id={id} />;
}
export default function LandPage({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  return <Suspense fallback={<div className="site-width section" role="status">Loading opportunity…</div>}>
    <Land params={params} />
  </Suspense>;
}
