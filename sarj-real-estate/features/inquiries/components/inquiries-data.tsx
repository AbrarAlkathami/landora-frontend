import { getInquiries } from "../api/inquiries";
import { InquiriesList } from "./inquiries-list";

type InquiriesDataProps = {
  page: number;
  search?: string;
  status?: string;
  areaOfCityWanted?: string;
  landTypeWanted?: string;
  prefers?: string;
};

export async function InquiriesData({
  page,
  search,
  status,
  areaOfCityWanted,
  landTypeWanted,
  prefers,
}: InquiriesDataProps) {
  const data = await getInquiries({
    page,
    pageSize: 10,
    search,
    status,
    areaOfCityWanted,
    landTypeWanted,
    prefers,
  });

  return (
    <InquiriesList
      inquiries={data.items}
      page={data.page}
      totalPages={data.total_pages}
      total={data.total}
    />
  );
}