"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Parcel } from "../types/parcel";

type ParcelDetailsDialogProps = {
  parcel: Parcel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ParcelDetailsDialog({
  parcel,
  open,
  onOpenChange,
}: ParcelDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{parcel.parcel_id}</DialogTitle>

          <DialogDescription>
            Parcel details and listing information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              District
            </p>
            <p className="font-medium">
              {parcel.district_en}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Area
            </p>
            <p className="font-medium">
              {parcel.area_of_city}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Land type
            </p>
            <p className="font-medium">
              {parcel.land_type}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Listing type
            </p>
            <p className="font-medium">
              {parcel.listing_type}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Size
            </p>
            <p className="font-medium">
              {parcel.area_sqm.toLocaleString()} sqm
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Price
            </p>
            <p className="font-medium">
              {parcel.total_price_sar
                ? `SAR ${parcel.total_price_sar.toLocaleString()}`
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>
            <p className="font-medium">
              {parcel.status}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}