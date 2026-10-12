"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getParcel } from "@/features/parcels/api/parcels";
import type { Parcel } from "@/features/parcels/types/parcel";
import { InquiryForm } from "./inquiry-form";

type ParcelDetailsDialogProps = {
  parcelId: string;
};

export function ParcelDetailsDialog({
  parcelId,
}: ParcelDetailsDialogProps) {
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    if (!open || parcel) return;

    try {
      setLoading(true);

      const data = await getParcel(parcelId);

      setParcel(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" className="w-full">
            View parcel
          </Button>
        }
      />

      <DialogContent>
        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading parcel...
          </p>
        )}

        {parcel && (
          <>
            <DialogHeader>
              <DialogTitle>{parcel.district_en}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {parcel.land_type}
                </Badge>

                <Badge variant="secondary">
                  {parcel.listing_type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Parcel ID</p>
                  <p className="font-medium">{parcel.parcel_id}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Area</p>
                  <p className="font-medium">{parcel.area_of_city}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {parcel.area_sqm.toLocaleString()} sqm
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Street width</p>
                  <p className="font-medium">
                    {parcel.street_width_m} m
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {parcel.total_price_sar
                      ? `SAR ${parcel.total_price_sar.toLocaleString()}`
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{parcel.status}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <InquiryForm parcel={parcel} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}