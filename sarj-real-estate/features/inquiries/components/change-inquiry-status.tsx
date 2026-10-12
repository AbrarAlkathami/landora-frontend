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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateInquiry } from "../api/inquiries";
import type { Inquiry } from "../types/inquiry";

type ChangeInquiryStatusProps = {
  inquiry: Inquiry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeInquiryStatus({
  inquiry,
  open,
  onOpenChange,
}: ChangeInquiryStatusProps) {
  const router = useRouter();

  const [status, setStatus] = useState(inquiry.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateInquiry(inquiry.inquiry_id, {
        status,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change inquiry status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}