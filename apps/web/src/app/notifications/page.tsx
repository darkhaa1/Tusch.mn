"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@web/components/ui";
import { Skeleton } from "@web/components/ui/skeleton";
import { useMarkAllRead, useMarkNotificationRead, useNotifications } from "@web/lib/hooks/useApi";
import type { Notification, NotificationType } from "@web/lib/api/types";
import { cn } from "@web/lib/utils";

const LIMIT = 20;

const notificationTargetByType: Record<NotificationType, string> = {
  NEW_MESSAGE: "/messages",
  NEW_OFFER: "/profile?tab=offers",
  OFFER_ACCEPTED: "/messages",
  OFFER_REJECTED: "/profile?tab=offers",
  NEW_REVIEW: "/profile",
  LISTING_HIDDEN: "/profile",
  ACCOUNT_SUSPENDED: "/profile",
};

function getNotificationTarget(type: NotificationType) {
  return notificationTargetByType[type] ?? "/profile";
}

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b px-4 py-4">
      <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

function NotificationRow({ item, onRead }: { item: Notification; onRead: (item: Notification) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRead(item)}
      className={cn(
        "flex w-full items-start gap-3 border-b px-4 py-4 text-left transition hover:bg-muted/40",
        !item.readAt ? "bg-blue-50/40" : "",
      )}
    >
      <div className="mt-1.5 h-2 w-2 shrink-0">
        {!item.readAt ? <span className="block h-2 w-2 rounded-full bg-blue-500" /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("text-sm font-medium text-foreground", !item.readAt && "font-semibold")}>
          {item.title}
        </p>
        <p className="text-sm text-muted-foreground">{item.body}</p>
        <p className="text-xs text-muted-foreground">{formatNotificationTime(item.createdAt)}</p>
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({ page, limit: LIMIT });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllRead();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleNotificationClick = async (item: Notification) => {
    if (!item.readAt) {
      await markReadMutation.mutateAsync({ notificationId: item.id });
    }
    router.push(getNotificationTarget(item.type));
  };

  const handleMarkAllRead = async () => {
    await markAllMutation.mutateAsync();
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          {unreadCount > 0 ? (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleMarkAllRead()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
        >
          Mark all as read
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <NotificationRow key={item.id} item={item} onRead={(n) => void handleNotificationClick(n)} />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      ) : null}
    </main>
  );
}
