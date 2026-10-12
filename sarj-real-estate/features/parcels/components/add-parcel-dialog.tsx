"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createParcel } from "../api/parcels";
import type { ParcelCreate } from "../types/parcel";

export function AddParcelDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [parcelId, setParcelId] = useState("");
  const [districtEn, setDistrictEn] = useState("");
  const [districtAr, setDistrictAr] = useState("");
  const [areaOfCity, setAreaOfCity] = useState("");
  const [landType, setLandType] = useState("");
  const [listingType, setListingType] = useState("");
  const [priceBasis, setPriceBasis] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [pricePerSqm, setPricePerSqm] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [streetWidth, setStreetWidth] = useState("");
  const [listedDate, setListedDate] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parcel: ParcelCreate = {
      parcel_id: parcelId,
      district_en: districtEn,
      district_ar: districtAr,
      area_of_city: areaOfCity,
      land_type: landType,
      listing_type: listingType,
      price_basis: priceBasis,
      area_sqm: Number(areaSqm),
      price_per_sqm_sar: pricePerSqm
        ? Number(pricePerSqm)
        : null,
      total_price_sar: totalPrice
        ? Number(totalPrice)
        : null,
      street_width_m: Number(streetWidth),
      status: "available",
      listed_date: listedDate,
      days_on_market: 0,
      lat: Number(lat),
      lng: Number(lng),
    };

    try {
      setIsSubmitting(true);

      await createParcel(parcel);

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 size-4" />
            Add Parcel
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parcel</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            placeholder="Parcel ID"
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
          />

          <Input
            placeholder="District English"
            value={districtEn}
            onChange={(e) => setDistrictEn(e.target.value)}
          />

          <Input
            placeholder="District Arabic"
            value={districtAr}
            onChange={(e) => setDistrictAr(e.target.value)}
          />

          <Select
            value={areaOfCity}
            onValueChange={(value) =>
              setAreaOfCity(value ?? "")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Area of city" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="West">West</SelectItem>
              <SelectItem value="Central">Central</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={landType}
            onValueChange={(value) =>
              setLandType(value ?? "")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Land type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="residential">
                Residential
              </SelectItem>

              <SelectItem value="commercial">
                Commercial
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={listingType}
            onValueChange={(value) => {
              const nextValue = value ?? "";

              setListingType(nextValue);

              if (nextValue === "sale") {
                setPriceBasis("asking price");
              }

              if (nextValue === "lease") {
                setPriceBasis("annual rent");
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sale / Lease" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Price basis"
            value={priceBasis}
            onChange={(e) => setPriceBasis(e.target.value)}
          />

          <Input
            placeholder="Size in sqm"
            type="number"
            value={areaSqm}
            onChange={(e) => setAreaSqm(e.target.value)}
          />

          <Input
            placeholder="Price per sqm"
            type="number"
            value={pricePerSqm}
            onChange={(e) =>
              setPricePerSqm(e.target.value)
            }
          />

          <Input
            placeholder="Total price"
            type="number"
            value={totalPrice}
            onChange={(e) =>
              setTotalPrice(e.target.value)
            }
          />

          <Input
            placeholder="Street width"
            type="number"
            value={streetWidth}
            onChange={(e) =>
              setStreetWidth(e.target.value)
            }
          />

          <Input
            type="date"
            value={listedDate}
            onChange={(e) =>
              setListedDate(e.target.value)
            }
          />

          <Input
            placeholder="Latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />

          <Input
            placeholder="Longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !parcelId ||
              !districtEn ||
              !districtAr ||
              !areaOfCity ||
              !landType ||
              !listingType ||
              !priceBasis ||
              !areaSqm ||
              !streetWidth ||
              !listedDate ||
              !lat ||
              !lng
            }
          >
            {isSubmitting ? "Saving..." : "Save Parcel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}