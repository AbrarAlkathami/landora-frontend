export type Parcel = {
    parcel_id: string;
    district_en: string;
    district_ar: string;
    area_of_city: string;
    land_type: string;
    listing_type: string;
    price_basis: string;
    area_sqm: number;
    price_per_sqm_sar: number | null;
    total_price_sar: number | null;
    street_width_m: number;
    status: string;
    listed_date: string;
    days_on_market: number;
    lat: number;
    lng: number;
  };
  
  export type ParcelCreate = Parcel;
  
  export type ParcelUpdate = Partial<Omit<Parcel, "parcel_id">>;
  
  export type PaginatedParcelsResponse = {
    items: Parcel[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  
  export type GetParcelsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    landType?: string;
    listingType?: string;
  };