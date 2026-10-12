import { getParcels } from "../api/parcels";
import { ParcelsList } from "./parcels-list";

type ParcelsDataProps = {
  page: number;
  search?: string;
  status?: string;
  landType?: string;
  listingType?: string;
};

export async function ParcelsData({
  page,
  search,
  status,
  landType,
  listingType,
}: ParcelsDataProps) {
  const data = await getParcels({
    page,
    pageSize: 10,
    search,
    status,
    landType,
    listingType,
  });

  return (
    <ParcelsList
      parcels={data.items}
      page={data.page}
      totalPages={data.total_pages}
      total={data.total}
    />
  );
}