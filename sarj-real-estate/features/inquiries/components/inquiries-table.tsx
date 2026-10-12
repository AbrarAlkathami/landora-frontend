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
import type { Inquiry } from "../types/inquiry";
import { ChangeInquiryStatus } from "./change-inquiry-status";
import { InquiryDetailsDialog } from "./inquiry-details-dialog";
import { DeleteInquiryDialog } from "./delete-inquiry-dialog";


type InquiriesTableProps = {
  inquiries: Inquiry[];
};

export function InquiriesTable({
  inquiries,
}: InquiriesTableProps) {
    const [selectedInquiry, setSelectedInquiry] =
  useState<Inquiry | null>(null);

    const [statusInquiry, setStatusInquiry] =
    useState<Inquiry | null>(null);

    const [deletingInquiry, setDeletingInquiry] =
    useState<Inquiry | null>(null);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inquiry</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Investor</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Buy / Lease</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.inquiry_id}>
              <TableCell className="font-medium">
                {inquiry.inquiry_id}
              </TableCell>

              <TableCell>{inquiry.date}</TableCell>

              <TableCell>
                {inquiry.investor_name}
              </TableCell>

              <TableCell>
                {inquiry.wants_to}
              </TableCell>

              <TableCell>
                {inquiry.land_type_wanted}
              </TableCell>

              <TableCell>
                {inquiry.area_of_city_wanted}
              </TableCell>

              <TableCell>
                {inquiry.prefers}
              </TableCell>

              <TableCell>
                {inquiry.budget_sar
                  ? `SAR ${inquiry.budget_sar.toLocaleString()}`
                  : "—"}
              </TableCell>

              <TableCell>
                <Badge variant="secondary">
                  {inquiry.status}
                </Badge>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />

                    <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => setSelectedInquiry(inquiry)}
                    >
                        View details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => setStatusInquiry(inquiry)}
                    >
                        Change status
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => setDeletingInquiry(inquiry)}
                    >
                        Delete inquiry
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedInquiry && (
        <InquiryDetailsDialog
            inquiry={selectedInquiry}
            open={!!selectedInquiry}
            onOpenChange={(open) => {
            if (!open) setSelectedInquiry(null);
            }}
        />
        )}

        {statusInquiry && (
        <ChangeInquiryStatus
            inquiry={statusInquiry}
            open={!!statusInquiry}
            onOpenChange={(open) => {
            if (!open) setStatusInquiry(null);
            }}
        />
        )}

        {deletingInquiry && (
        <DeleteInquiryDialog
            inquiryId={deletingInquiry.inquiry_id}
            open={!!deletingInquiry}
            onOpenChange={(open) => {
            if (!open) setDeletingInquiry(null);
            }}
        />
        )}
    </div>
  );
}