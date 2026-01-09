"use client";

import { Heart, MapPin, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card } from "@repo/ui";
import { cn } from "../../app/lib/utils";
import resolveAvatarUrl from "../../app/lib/resolveImageUrl";
import type { CurrentUser } from "../../app/lib/api";

type ProfileHeaderProps = {
  user: CurrentUser | null | undefined;
};

const gradientBg = "bg-gradient-to-r from-secondary/80 via-primary/70 to-primary";

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const avatar = resolveAvatarUrl(user?.avatarUrl || null);
  const firstName = user?.firstName || (user as any)?.firstname || "—";
  const lastName = user?.lastName || (user as any)?.lastname || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const role = user?.role === "PROVIDER" ? "Үйлчилгээ үзүүлэгч" : user?.role === "BOTH" ? "Хосолсон" : "Хэрэглэгч";
  const location = (user as any)?.location || (user as any)?.city || "";

  return (
    <Card className="overflow-hidden border border-border/80">
      <div className="relative">
        <div className={cn("h-48 md:h-60 w-full", avatar ? "bg-muted" : gradientBg)} />
        <div className="absolute -bottom-10 left-6 flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              {avatar ? <AvatarImage src={avatar} alt={fullName || "Profile"} /> : null}
              <AvatarFallback className="text-xl font-semibold">{(fullName || "—").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{fullName || "—"}</h1>
              <Badge variant="secondary">{role}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Онлайн
              </span>
              {location ? (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {location}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-4 hidden gap-2 sm:flex">
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" aria-label="Дуртай">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" aria-label="Хуваалцах">
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="pt-12 pb-4 px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:hidden">
            <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" aria-label="Дуртай">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" aria-label="Хуваалцах">
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
