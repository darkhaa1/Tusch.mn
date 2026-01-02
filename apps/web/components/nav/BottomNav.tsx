"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, List, MessageCircle, PlusCircle, User } from "lucide-react";
import { cn } from "../../app/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isPoster?: boolean;
};

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    { href: "/", label: "Нүүр", icon: Home },
    { href: "/listings", label: "Зарууд", icon: List },
    {
      href: "/listings",
      label: "Нэмэх",
      icon: PlusCircle,
      isPoster: true,
      onClick: () => router.push("/listings"),
    },
    { href: "/messages", label: "Мессеж", icon: MessageCircle },
    { href: "/profile", label: "Профайл", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 px-2 py-2 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.25)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const content = (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition",
                item.isPoster
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", item.isPoster ? "text-primary-foreground" : undefined)} />
              <span>{item.label}</span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex-1"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className="flex-1" aria-label={item.label}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
