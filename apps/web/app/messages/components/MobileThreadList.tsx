"use client";

import Link from "next/link";
import { Avatar, Badge } from "@repo/ui";
import type { ThreadItem } from "../types";
import { formatTime, truncate, buildDisplayName } from "./utils";

type MobileThreadListProps = {
  items: ThreadItem[];
  isLoading: boolean;
  onSelect: (partnerId: string) => void;
};

export function MobileThreadList({ items, isLoading, onSelect }: MobileThreadListProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-background shadow-sm sm:hidden">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium text-foreground">Харилцаанууд</p>
      </div>
      <div className="divide-y">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border border-border border-t-transparent" />
            Харилцаануудыг ачааллаж байна...
          </div>
        ) : items.length ? (
          items.map((thread) => {
            const name = buildDisplayName(thread.partner);
            return (
              <div
                key={thread.partnerId}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
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
                    <p className="text-xs text-muted-foreground">Профайл</p>
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
                  <Badge className="h-6 min-w-[24px] justify-center rounded-full px-2 text-xs">{thread.unread}</Badge>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">Одоогоор яриа алга.</div>
        )}
      </div>
    </div>
  );
}
