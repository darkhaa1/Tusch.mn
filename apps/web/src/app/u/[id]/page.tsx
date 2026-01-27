"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, Phone, Mail } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import { usePublicUserProfile } from "@web/lib/hooks/useApi";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import { cn } from "@web/lib/utils";

function formatMemberSince(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  if (months <= 0) return "Шинэ гишүүн";
  if (months === 1) return "1 сар";
  return `${months} сар`;
}

function RatingBadge({ rating, count }: { rating: number | null; count: number }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
      <span className="font-medium text-foreground">{rating?.toFixed(1) ?? "—"}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}
export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { data, isLoading, error } = usePublicUserProfile(userId);

  const memberSince = formatMemberSince(data?.user.createdAt);
  const avatarUrl = resolveImageUrl(data?.user.avatarUrl || undefined) || undefined;

  const contactHref = `/messages?partnerId=${userId || ""}`;

  const overviewList = data?.recentListings || [];
  const reviews = data?.reviews || [];

  const trustBadges = [
    { label: "Имэйл баталгаажсан", icon: Mail, active: data?.user.verification.emailVerified },
    { label: "Утас баталгаажсан", icon: Phone, active: data?.user.verification.phoneVerified },
    { label: "ID баталгаажуулалт", icon: ShieldCheck, active: data?.user.verification.idVerified },
  ];

  const isError = !!error;

  return (
    <AppShell
      title="Нийтийн профиль"
      description="Хэрэглэгчийн нийтэд харагдах мэдээлэл."
      actions={
        <Button variant="secondary" onClick={() => router.back()}>
          Буцах
        </Button>
      }
    >

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Профайл олдсонгүй.</CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-4">
          <Card className="border border-border/80">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar src={avatarUrl} alt={`${data.user.firstName} ${data.user.lastName}`} className="h-20 w-20" />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Профайл</p>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {[data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || "Хэрэглэгч"}
                    </h2>
                    <p className="text-xs text-muted-foreground">Профайл: {memberSince}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {trustBadges.map((badge) => (
                      <Badge
                        key={badge.label}
                        variant={badge.active ? "secondary" : "outline"}
                        className={cn("gap-1", badge.active ? "border-primary/30" : "")}
                      >
                        <badge.icon className="h-4 w-4" />
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={contactHref} prefetch={false}>
                  <Button variant="default" size="sm">
                    Холбогдох
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="space-y-1 p-4">
                <p className="text-xs uppercase text-muted-foreground">Үнэлгээ</p>
                <RatingBadge rating={data.stats.ratingAvg} count={data.stats.reviewsCount} />
                <p className="text-xs text-muted-foreground">Сэтгэгдэл: {data.stats.reviewsCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-4">
                <p className="text-xs uppercase text-muted-foreground">Зарууд</p>
                <p className="text-lg font-semibold text-foreground">{data.stats.listingsCount}</p>
                <p className="text-xs text-muted-foreground">Нийт нийтэлсэн</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-4">
                <p className="text-xs uppercase text-muted-foreground">Хариу</p>
                <p className="text-lg font-semibold text-foreground">{data.stats.responseRate ? `${data.stats.responseRate}%` : "—"}</p>
                <p className="text-xs text-muted-foreground">Дундаж хариу (одоогоор мэдээлэлгүй)</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Товч</TabsTrigger>
              <TabsTrigger value="reviews">Сэтгэгдэл</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-3">
              {overviewList.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {overviewList.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden border border-border/70">
                      <div className="aspect-4/3 w-full bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveImageUrl(listing.imageUrl || undefined) || "/placeholder.jpg"}
                          alt={listing.description}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-semibold text-foreground">{listing.price.toLocaleString()} ₮</p>
                          <p className="text-muted-foreground text-xs">{listing.location || "Байршил оруулаагүй"}</p>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">Одоогоор нийтэлсэн зар байхгүй.</CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="space-y-3">
              {reviews.length ? (
                reviews.map((review) => (
                  <Card key={review.id} className="border border-border/70">
                    <CardContent className="flex items-start gap-3 p-4">
                      <Avatar
                        src={resolveImageUrl(review.reviewer.avatarUrl || undefined) || undefined}
                        alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {[review.reviewer.firstName, review.reviewer.lastName].filter(Boolean).join(" ")}
                          </p>
                          <RatingBadge rating={review.rating} count={1} />
                        </div>
                        <p className="text-sm text-foreground">{review.comment || "Сэтгэгдэл үлдээгүй."}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">Одоогоор сэтгэгдэл алга.</CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </AppShell>
  );
}
