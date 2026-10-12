import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { InquiryChatResult } from "../api/chat";

type InquiryResultCardProps = {
  inquiry: InquiryChatResult;
};

export function InquiryResultCard({
  inquiry,
}: InquiryResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {inquiry.investor_name}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {inquiry.inquiry_id}
            </p>
          </div>

          <Badge variant="secondary">
            {inquiry.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Land type</p>
            <p className="font-medium">
              {inquiry.land_type_wanted}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Area</p>
            <p className="font-medium">
              {inquiry.area_of_city_wanted}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}