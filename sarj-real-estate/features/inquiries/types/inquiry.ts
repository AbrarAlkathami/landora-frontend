export type Inquiry = {
    inquiry_id: string;
    date: string;
    investor_name: string;
    phone: string;
    wants_to: string;
    selected_parcel_id?: string | null;
    land_type_wanted: string;
    area_of_city_wanted: string;
    prefers: string;
    budget_sar: number | null;
    budget_basis: string | null;
    intent: string;
    channel: string;
    status: string;
  };
  
  export type InquiryCreate = Inquiry;
  
  export type InquiryUpdate = Partial<Omit<Inquiry, "inquiry_id">>;

  export type PaginatedInquiriesResponse = {
    items: Inquiry[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  
  export type GetInquiriesParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    areaOfCityWanted?: string;
    landTypeWanted?: string;
    prefers?: string;
  };
