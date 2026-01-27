"use client";

import Link from "next/link";
import { Avatar, Badge } from "@web/components/ui";
import { formatTime, truncate, buildDisplayName } from "./utils";
import type { ThreadItem } from "../types";

type ThreadListProps = {
  items: ThreadItem[];
  isLoading: boolean;
  error?: unknown;
  activePartnerId: string | null;
  onSelect: (partnerId: string) => void;
};

export function ThreadList({ items, isLoading, error, activePartnerId, onSelect }: ThreadListProps) {
  return (
    <div className="hidden rounded-xl border border-border/80 bg-background shadow-sm sm:block">
      <div className="divide-y">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border border-border border-t-transparent" />
            Мессежүүдийг ачаалж байна...
          </div>
        ) : error ? (
          <div className="px-4 py-4 text-sm text-red-600">Мессежүүдийг авахад алдаа гарлаа.</div>
        ) : items.length ? (
          items.map((thread) => {
            const isActive = thread.partnerId === activePartnerId;
            const name = buildDisplayName(thread.partner);
            return (
              <div
                key={thread.partnerId}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${isActive ? "bg-primary/5" : "hover:bg-muted"
                  }`}
                onClick={() => onSelect(thread.partnerId)}
              >
                <Link
                  href={`/u/${thread.partnerId}`}
                  prefetch={false}
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar src={thread.partnerAvatar || undefined} alt={name} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground line-clamp-1">{name}</div>
                    <p className="text-xs text-muted-foreground">Сүүлд идэвхтэй.</p>
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground line-clamp-1">
                      {truncate(thread.lastMessage.content)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(thread.lastMessage.createdAt)}
                    </span>
                  </div>
                </div>
                {thread.unread ? (
                  <Badge className="h-6 min-w-6 justify-center rounded-full px-2 text-xs">{thread.unread}</Badge>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">Одоогоор мессеж алга.</div>
        )}
      </div>
    </div>
  );
}

