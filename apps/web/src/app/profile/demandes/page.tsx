"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@web/components/layout/AppShell";
import { useMyListings } from "@web/lib/hooks/useApi";
import { Card, CardContent, Button } from "@web/components/ui";
import ListingCard from "@web/features/listings/ListingCard";

export default function ProfileDemandesPage() {
  const { data: listings, isLoading } = useMyListings();
  const items = useMemo(() => listings || [], [listings]);

  return (
    <AppShell
      title="Миний хүсэлтүүд"
    >
      <Card className="border border-border/80">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Миний зарууд</h2>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Уншиж байна...</p>
          ) : items.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Одоогоор зар байхгүй.</p>
              <Link href="/listings?create=1">
                <Button size="sm">Зар нэмэх</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
