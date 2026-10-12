"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createInquiry } from "@/features/inquiries/api/inquiries";
import type { InquiryCreate } from "@/features/inquiries/types/inquiry";
import type { Parcel } from "@/features/parcels/types/parcel";

type InquiryFormProps = {
  parcel: Parcel;
};


export function InquiryForm({ parcel }: InquiryFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const inquiry: InquiryCreate = {
      inquiry_id: `INQ-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      investor_name: name,
      phone,
      wants_to: message || `Interested in ${parcel.parcel_id}`,
      land_type_wanted: parcel.land_type,
      area_of_city_wanted: parcel.area_of_city,
      prefers: parcel.listing_type,
      budget_sar: budget ? Number(budget) : null,
      budget_basis:
        parcel.listing_type === "sale"
          ? "total purchase"
          : "annual rent",
      intent: "interested",
      channel: channel || "website",
      status: "new",
    };

    try {
      await createInquiry(inquiry);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg bg-muted p-4 text-sm">
        Your inquiry has been submitted successfully.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Interested in this parcel?</h3>
        <p className="text-sm text-muted-foreground">
          Leave your details and our team will contact you.
        </p>
      </div>

      <Input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Budget (SAR)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />

      <Select
        value={channel}
        onValueChange={(value) => setChannel(value ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Preferred contact method" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="phone">Phone</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Anything else you'd like us to know?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!name || !phone}
      >
        Send inquiry
      </Button>
    </div>
  );
}