"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateParcel } from "../api/parcels";
import type { Parcel } from "../types/parcel";

type EditParcelDialogProps = {
  parcel: Parcel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditParcelDialog({
  parcel,
  open,
  onOpenChange,
}: EditParcelDialogProps) {
  const router = useRouter();

  const [districtEn, setDistrictEn] = useState(parcel.district_en);
  const [districtAr, setDistrictAr] = useState(parcel.district_ar);
  const [areaOfCity, setAreaOfCity] = useState(parcel.area_of_city);
  const [landType, setLandType] = useState(parcel.land_type);
  const [listingType, setListingType] = useState(parcel.listing_type);
  const [priceBasis, setPriceBasis] = useState(parcel.price_basis);
  const [areaSqm, setAreaSqm] = useState(String(parcel.area_sqm));
  const [pricePerSqm, setPricePerSqm] = useState(
    parcel.price_per_sqm_sar?.toString() ?? "",
  );
  const [totalPrice, setTotalPrice] = useState(
    parcel.total_price_sar?.toString() ?? "",
  );
  const [streetWidth, setStreetWidth] = useState(
    String(parcel.street_width_m),
  );
  const [status, setStatus] = useState(parcel.status);
  const [listedDate, setListedDate] = useState(parcel.listed_date);
  const [lat, setLat] = useState(String(parcel.lat));
  const [lng, setLng] = useState(String(parcel.lng));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      await updateParcel(parcel.parcel_id, {
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
        status,
        listed_date: listedDate,
        lat: Number(lat),
        lng: Number(lng),
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {parcel.parcel_id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            value={districtEn}
            onChange={(e) => setDistrictEn(e.target.value)}
            placeholder="District English"
          />

          <Input
            value={districtAr}
            onChange={(e) => setDistrictAr(e.target.value)}
            placeholder="District Arabic"
          />

          <Select
            value={areaOfCity}
            onValueChange={(value) => setAreaOfCity(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Area" />
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
            onValueChange={(value) => setLandType(value ?? "")}
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
            onValueChange={(value) => setListingType(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Listing type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={priceBasis}
            onChange={(e) => setPriceBasis(e.target.value)}
            placeholder="Price basis"
          />

          <Input
            type="number"
            value={areaSqm}
            onChange={(e) => setAreaSqm(e.target.value)}
            placeholder="Area sqm"
          />

          <Input
            type="number"
            value={pricePerSqm}
            onChange={(e) => setPricePerSqm(e.target.value)}
            placeholder="Price per sqm"
          />

          <Input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            placeholder="Total price"
          />

          <Input
            type="number"
            value={streetWidth}
            onChange={(e) => setStreetWidth(e.target.value)}
            placeholder="Street width"
          />

          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="available">
                Available
              </SelectItem>

              <SelectItem value="sold">
                Sold
              </SelectItem>

              <SelectItem value="leased">
                Leased
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={listedDate}
            onChange={(e) => setListedDate(e.target.value)}
          />

          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
          />

          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}