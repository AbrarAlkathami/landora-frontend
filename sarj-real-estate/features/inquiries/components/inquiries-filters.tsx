"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InquiriesFiltersProps = {
  search: string;
  status: string;
  area: string;
  landType: string;
  prefers: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onLandTypeChange: (value: string) => void;
  onPrefersChange: (value: string) => void;
};

export function InquiriesFilters({
  search,
  status,
  area,
  landType,
  prefers,
  onSearchChange,
  onStatusChange,
  onAreaChange,
  onLandTypeChange,
  onPrefersChange,
}: InquiriesFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search by inquiry or investor..."
        className="max-w-sm"
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
      />

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value ?? "")
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={area}
        onValueChange={(value) =>
          onAreaChange(value ?? "")
        }
      >
        <SelectTrigger className="w-[160px]">
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
        onValueChange={(value) =>
          onLandTypeChange(value ?? "")
        }
      >
        <SelectTrigger className="w-[160px]">
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
        value={prefers}
        onValueChange={(value) =>
          onPrefersChange(value ?? "")
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Buy / Lease" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="sale">Buy</SelectItem>
          <SelectItem value="lease">Lease</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}