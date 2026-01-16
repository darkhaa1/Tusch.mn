"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent } from "@repo/ui";
import type { CurrentUser } from "../../app/lib/api/types";

type ProfileTabsProps = {
  user: CurrentUser | null | undefined;
};

const placeholderImages = ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"];

export function ProfileTabs({ user }: ProfileTabsProps) {
  const createdAt = (user as any)?.createdAt ? new Date((user as any).createdAt) : null;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger
          value="overview"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Танилцуулга
        </TabsTrigger>
        <TabsTrigger
          value="photos"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Зургууд
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Сэтгэгдэл
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Идэвх
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground">Үнэлгээ / Сэтгэгдэл</p>
              <p className="text-xl font-semibold">—</p>
              <p className="text-sm text-muted-foreground">Одоогоор мэдээлэлгүй</p>
            </CardContent>
          </Card>
          <Card className="border border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground">Бүртгүүлсэн огноо</p>
              <p className="text-xl font-semibold">
                {createdAt ? createdAt.toISOString().slice(0, 10) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Нэгдсэн өдөр</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="photos">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {placeholderImages.map((src, idx) => (
                <div key={idx} className="aspect-video overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Photo placeholder" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Одоогоор сэтгэгдэл алга.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card className="border border-border/80">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Миний зарууд</p>
            <p className="text-sm text-muted-foreground">Одоогоор мэдээлэлгүй.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
