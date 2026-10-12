"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Inquiry } from "../types/inquiry";

type InquiryDetailsDialogProps = {
  inquiry: Inquiry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InquiryDetailsDialog({
  inquiry,
  open,
  onOpenChange,
}: InquiryDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inquiry.inquiry_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-2">
            <Badge variant="secondary">
              {inquiry.status}
            </Badge>

            <Badge variant="secondary">
              {inquiry.intent}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                Investor
              </p>
              <p className="font-medium">
                {inquiry.investor_name}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Phone
              </p>
              <p className="font-medium">
                {inquiry.phone}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Date
              </p>
              <p className="font-medium">
                {inquiry.date}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Channel
              </p>
              <p className="font-medium">
                {inquiry.channel}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Land type
              </p>
              <p className="font-medium">
                {inquiry.land_type_wanted}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Area
              </p>
              <p className="font-medium">
                {inquiry.area_of_city_wanted}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Preference
              </p>
              <p className="font-medium">
                {inquiry.prefers}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Budget
              </p>
              <p className="font-medium">
                {inquiry.budget_sar
                  ? `SAR ${inquiry.budget_sar.toLocaleString()}`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Budget basis
              </p>
              <p className="font-medium">
                {inquiry.budget_basis ?? "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Wants to
            </p>

            <p className="mt-1 text-sm font-medium">
              {inquiry.wants_to}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}