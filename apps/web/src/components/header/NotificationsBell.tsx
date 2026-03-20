"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@web/components/ui";
import { Skeleton } from "@web/components/ui/skeleton";
import { useMarkAllRead, useMarkNotificationRead, useNotifications } from "@web/lib/hooks/useApi";
import type { Notification, NotificationType } from "@web/lib/api/types";
import { cn } from "@web/lib/utils";

const notificationTargetByType: Record<NotificationType, string> = {
  NEW_MESSAGE: "/messages",
  NEW_OFFER: "/profile?tab=offers",
  OFFER_ACCEPTED: "/messages",
  OFFER_REJECTED: "/profile?tab=offers",
  NEW_REVIEW: "/profile",
  LISTING_HIDDEN: "/profile",
  ACCOUNT_SUSPENDED: "/profile",
  REVIEW_REQUESTED: "/profile?tab=history",
};

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationTarget(type: NotificationType) {
  return notificationTargetByType[type] || "/profile";
}

export function NotificationsBell() {
  const router = useRouter();
  const { data, isLoading } = useNotifications({ page: 1, limit: 8 });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllRead();

  const items = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative ui-interactive">
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0 || markAllMutation.isPending}
            className="text-xs font-medium text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 border-b px-3 py-3">
                  <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</p>
          ) : null}

          {!isLoading
            ? items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleNotificationClick(item)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-3 py-3 text-left transition hover:bg-muted/40",
                    !item.readAt ? "bg-blue-50/40" : ""
                  )}
                >
                  <div className="mt-1 h-2 w-2 shrink-0">
                    {!item.readAt ? <span className="block h-2 w-2 rounded-full bg-blue-500" /> : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                    <p className="text-[11px] text-muted-foreground">{formatNotificationTime(item.createdAt)}</p>
                  </div>
                </button>
              ))
            : null}
        </div>

        <div className="border-t px-3 py-2">
          <a
            href="/notifications"
            className="block text-center text-xs font-medium text-primary hover:underline"
          >
            View all notifications
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
