"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import type { Inquiry } from "../types/inquiry";
import { InquiriesFilters } from "./inquiries-filters";
import { InquiriesTable } from "./inquiries-table";

type InquiriesListProps = {
  inquiries: Inquiry[];
  page: number;
  totalPages: number;
  total: number;
};

export function InquiriesList({
  inquiries,
  page,
  totalPages,
  total,
}: InquiriesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const updatePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";

      if (search === currentSearch) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  return (
    <div className="space-y-6">

      <InquiriesFilters
        search={search}
        status={searchParams.get("status") ?? ""}
        area={searchParams.get("area_of_city_wanted") ?? ""}
        landType={searchParams.get("land_type_wanted") ?? ""}
        prefers={searchParams.get("prefers") ?? ""}
        onSearchChange={setSearch}
        onStatusChange={(value) =>
            updateParam("status", value)
        }
        onAreaChange={(value) =>
            updateParam("area_of_city_wanted", value)
        }
        onLandTypeChange={(value) =>
            updateParam("land_type_wanted", value)
        }
        onPrefersChange={(value) =>
            updateParam("prefers", value)
        }
        />

      <p className="text-sm text-muted-foreground">
        {total} inquiries found
      </p>

      <InquiriesTable inquiries={inquiries} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
        Page {totalPages === 0 ? 0 : page} of {totalPages}
                </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => updatePage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={() => updatePage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}