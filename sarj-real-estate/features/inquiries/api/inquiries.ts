import type {
    GetInquiriesParams,
    Inquiry,
    InquiryCreate,
    InquiryUpdate,
    PaginatedInquiriesResponse,
  } from "../types/inquiry";
  
  const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";
  
  export async function getInquiries({
    page = 1,
    pageSize = 10,
    search,
    status,
    areaOfCityWanted,
    landTypeWanted,
    prefers,
  }: GetInquiriesParams = {}): Promise<PaginatedInquiriesResponse> {
    const params = new URLSearchParams();
  
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
  
    if (search) {
      params.set("search", search);
    }
  
    if (status) {
      params.set("status", status);
    }
  
    if (areaOfCityWanted) {
      params.set("area_of_city_wanted", areaOfCityWanted);
    }
  
    if (landTypeWanted) {
      params.set("land_type_wanted", landTypeWanted);
    }
  
    if (prefers) {
      params.set("prefers", prefers);
    }
  
    const response = await fetch(
      `${API_URL}/inquiries/?${params.toString()}`,
      {
        cache: "no-store",
      },
    );
  
    if (!response.ok) {
      throw new Error(
        `Failed to fetch inquiries: ${response.status} ${response.statusText}`,
      );
    }
  
    return response.json();
  }

  
  export async function getInquiry(
    inquiryId: string,
  ): Promise<Inquiry> {
    const response = await fetch(
      `${API_URL}/inquiries/${inquiryId}`,
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch inquiry");
    }
  
    return response.json();
  }
  
  export async function createInquiry(
    inquiry: InquiryCreate,
  ): Promise<Inquiry> {
    const response = await fetch(`${API_URL}/inquiries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inquiry),
    });
  
    if (!response.ok) {
      throw new Error("Failed to create inquiry");
    }
  
    return response.json();
  }
  
  export async function updateInquiry(
    inquiryId: string,
    inquiry: InquiryUpdate,
  ): Promise<Inquiry> {
    const response = await fetch(
      `${API_URL}/inquiries/${inquiryId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiry),
      },
    );
  
    if (!response.ok) {
      throw new Error("Failed to update inquiry");
    }
  
    return response.json();
  }
  
  export async function deleteInquiry(
    inquiryId: string,
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/inquiries/${inquiryId}`,
      {
        method: "DELETE",
      },
    );
  
    if (!response.ok) {
      throw new Error("Failed to delete inquiry");
    }
  }