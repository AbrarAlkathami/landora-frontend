"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";

import type { Parcel } from "../types/parcel";
import { ParcelDetailsDialog } from "./parcel-details-dialog";
import { EditParcelDialog } from "./edit-parcel-dialog";
import { DeleteParcelDialog } from "./delete-parcel-dialog";

type ParcelsTableProps = {
  parcels: Parcel[];
};

export function ParcelsTable({
  parcels,
}: ParcelsTableProps) {
    const [selectedParcel, setSelectedParcel] =
    useState<Parcel | null>(null);
  
  const [editingParcel, setEditingParcel] =
    useState<Parcel | null>(null);
  
  const [deletingParcel, setDeletingParcel] =
    useState<Parcel | null>(null);  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parcel</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {parcels.map((parcel) => (
            <TableRow key={parcel.parcel_id}>
              <TableCell className="font-medium">
                {parcel.parcel_id}
              </TableCell>

              <TableCell>{parcel.district_en}</TableCell>

              <TableCell>{parcel.area_of_city}</TableCell>

              <TableCell>{parcel.land_type}</TableCell>

              <TableCell>{parcel.listing_type}</TableCell>

              <TableCell>
                {parcel.area_sqm.toLocaleString()} sqm
              </TableCell>

              <TableCell>
                {parcel.total_price_sar
                  ? `SAR ${parcel.total_price_sar.toLocaleString()}`
                  : "—"}
              </TableCell>

              <TableCell>
                <Badge variant="secondary">
                  {parcel.status}
                </Badge>
              </TableCell>

              <TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open parcel actions</span>
        </Button>
      }
    />

    <DropdownMenuContent align="end">
    <DropdownMenuItem
        onClick={() => setSelectedParcel(parcel)}
        >
        View details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setEditingParcel(parcel)}>
        Edit parcel
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setDeletingParcel(parcel)}>
        Delete parcel
        </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedParcel && (
  <ParcelDetailsDialog
    parcel={selectedParcel}
    open={!!selectedParcel}
    onOpenChange={(open) => {
      if (!open) setSelectedParcel(null);
    }}
  />
)}

{editingParcel && (
  <EditParcelDialog
    parcel={editingParcel}
    open={!!editingParcel}
    onOpenChange={(open) => {
      if (!open) setEditingParcel(null);
    }}
  />
)}

{deletingParcel && (
  <DeleteParcelDialog
    parcelId={deletingParcel.parcel_id}
    open={!!deletingParcel}
    onOpenChange={(open) => {
      if (!open) setDeletingParcel(null);
    }}
  />
)}

    </div>
  );
}