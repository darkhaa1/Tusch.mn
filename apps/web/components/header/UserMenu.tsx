"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Info, KeyRound, List, Shield, User as UserIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "../../app/lib/utils";

type UserMenuProps = {
  firstName: string;
  avatarUrl?: string | null;
  initials: string;
  onLogout: () => void;
  isAdmin?: boolean;
};

export function UserMenu({ firstName, avatarUrl, initials, onLogout, isAdmin }: UserMenuProps) {
  const router = useRouter();

  const navigate = (href: string) => {
    router.push(href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-full px-2 py-1 h-10 hover:bg-muted",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <div className="relative">
          <Avatar className="h-8 w-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName || "Profile"} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        </div>
        <span className="text-sm font-medium text-foreground">{firstName || "Профайл"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[280px]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative">
            <Avatar className="h-10 w-10">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName || "Profile"} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{firstName || "Профайл"}</span>
            <span className="text-xs text-muted-foreground">Онлайн</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
          <UserIcon className="h-4 w-4" aria-hidden="true" />
          <span>Миний профайл</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile/demandes")} className="gap-2">
          <List className="h-4 w-4" aria-hidden="true" />
          <span>Миний хүсэлтүүд</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile/informations")} className="gap-2">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>Хувийн мэдээлэл</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile/identifiants")} className="gap-2">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          <span>Нэвтрэх мэдээлэл</span>
        </DropdownMenuItem>
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Админ</span>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-red-500"
          onClick={onLogout}
        >
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
