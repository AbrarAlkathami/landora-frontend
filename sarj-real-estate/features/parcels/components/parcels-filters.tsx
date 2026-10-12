import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ParcelsFiltersProps = {
  search: string;
  status: string;
  landType: string;
  listingType: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLandTypeChange: (value: string) => void;
  onListingTypeChange: (value: string) => void;
};

export function ParcelsFilters({
  search,
  status,
  landType,
  listingType,
  onSearchChange,
  onStatusChange,
  onLandTypeChange,
  onListingTypeChange,
}: ParcelsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search by parcel or district..."
        className="max-w-sm"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
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
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="leased">Leased</SelectItem>
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
        value={listingType}
        onValueChange={(value) =>
          onListingTypeChange(value ?? "")
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sale / Lease" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="sale">Sale</SelectItem>
          <SelectItem value="lease">Lease</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}