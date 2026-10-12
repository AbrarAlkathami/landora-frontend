import type {
  GetParcelsParams,
  PaginatedParcelsResponse,
  Parcel,
  ParcelCreate,
  ParcelUpdate,
} from "../types/parcel";
  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  
    export async function getParcels({
      page = 1,
      pageSize = 10,
      search,
      status,
      landType,
      listingType,
    }: GetParcelsParams = {}): Promise<PaginatedParcelsResponse> {
      const params = new URLSearchParams();
    
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
    
      if (search) {
        params.set("search", search);
      }
    
      if (status) {
        params.set("status", status);
      }
    
      if (landType) {
        params.set("land_type", landType);
      }
    
      if (listingType) {
        params.set("listing_type", listingType);
      }
    
      const response = await fetch(
        `${API_URL}/parcels/?${params.toString()}`,
        {
          cache: "no-store",
        },
      );
    
      if (!response.ok) {
        throw new Error(
          `Failed to fetch parcels: ${response.status} ${response.statusText}`,
        );
      }
    
      return response.json();
    }
  
  export async function getParcel(
    parcelId: string,
  ): Promise<Parcel> {
    const response = await fetch(
      `${API_URL}/parcels/${parcelId}`,
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch parcel");
    }
  
    return response.json();
  }
  
  export async function createParcel(
    parcel: ParcelCreate,
  ): Promise<Parcel> {
    const response = await fetch(`${API_URL}/parcels/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parcel),
    });
  
    if (!response.ok) {
      throw new Error("Failed to create parcel");
    }
  
    return response.json();
  }
  
  export async function updateParcel(
    parcelId: string,
    parcel: ParcelUpdate,
  ): Promise<Parcel> {
    const response = await fetch(
      `${API_URL}/parcels/${parcelId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcel),
      },
    );
  
    if (!response.ok) {
      throw new Error("Failed to update parcel");
    }
  
    return response.json();
  }
  
  export async function deleteParcel(
    parcelId: string,
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/parcels/${parcelId}`,
      {
        method: "DELETE",
      },
    );
  
    if (!response.ok) {
      throw new Error("Failed to delete parcel");
    }
  }