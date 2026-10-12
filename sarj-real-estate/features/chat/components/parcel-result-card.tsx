import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ParcelChatResult } from "../api/chat";
import { ParcelDetailsDialog } from "./parcel-details-dialog";

type ParcelResultCardProps = {
  parcel: ParcelChatResult;
};

export function ParcelResultCard({
  parcel,
}: ParcelResultCardProps) {
    return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {parcel.district_en}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {parcel.parcel_id}
            </p>
          </div>

          <Badge variant="secondary">
            {parcel.listing_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Land type</p>
            <p className="font-medium">
              {parcel.land_type}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">
              {parcel.status}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">
              {parcel.total_price_sar
                ? `SAR ${parcel.total_price_sar.toLocaleString()}`
                : "Not available"}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <ParcelDetailsDialog
          parcelId={parcel.parcel_id}
        />
      </CardFooter>
    </Card>
  );
}