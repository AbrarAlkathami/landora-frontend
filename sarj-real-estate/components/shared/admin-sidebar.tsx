"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  MessageSquareText,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Parcels",
    href: "/admin/parcels",
    icon: Map,
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: MessageSquareText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 border-r p-4">
      <div className="mb-8 text-lg font-semibold">
        Landora Admin
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}