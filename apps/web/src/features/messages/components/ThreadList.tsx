/**
 * Atelier Desktop Thread List.
 *
 * Adapts the mobile list (atelier.jsx 532-586) into a 400px-max left rail:
 * sticky eyebrow + serif italic count headline + mono caps filter chips +
 * scrollable thread rows. Active row gets cream surround + terre side bar.
 *
 * No desktop design source; adaptation per SA-7 brief. Mobile variant lives in
 * MobileThreadList.tsx.
 */
"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@web/components/ui-v2";
import type { PlaceholderTone } from "@web/components/ui-v2";
import { formatTime, truncate, buildDisplayName } from "./utils";
import type { ThreadItem } from "../types";

const labels = {
  eyebrow: "ЗУРВАС",
  conversations: "яриа",
  filterAll: "Бүгд",
  filterUnread: "Уншаагүй",
  filterOffers: "Саналтай",
  empty: "Одоогоор зурвас алга.",
  loading: "Зурвасуудыг ачаалж байна…",
  error: "Зурвасуудыг авахад алдаа гарлаа.",
  lastActive: "Сүүлд идэвхтэй",
};

type Filter = "all" | "unread" | "offers";

const TONES: ReadonlyArray<PlaceholderTone> = ["terre", "olive", "sand", "rose", "ocre"];

function toneFor(id: string): PlaceholderTone {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length] ?? "sand";
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "·";
}

type ThreadListProps = {
  items: ThreadItem[];
  isLoading: boolean;
  error?: unknown;
  activePartnerId: string | null;
  onSelect: (partnerId: string) => void;
};

export function ThreadList({
  items,
  isLoading,
  error,
  activePartnerId,
  onSelect,
}: ThreadListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((t) => t.unread > 0);
    return items;
  }, [items, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: labels.filterAll },
    { key: "unread", label: labels.filterUnread },
    { key: "offers", label: labels.filterOffers },
  ];

  return (
    <aside className="hidden md:flex md:flex-col h-full bg-atelier-paper border-r border-atelier-line min-w-0">
      {/* Sticky header */}
      <div
        className="border-b border-atelier-line bg-atelier-paper"
        style={{ padding: "20px 24px 14px" }}
      >
        <div
          className="uppercase text-atelier-muted"
          style={{ fontFamily: "var(--at-mono)", fontSize: 10, letterSpacing: "0.2em" }}
        >
          {labels.eyebrow}
        </div>
        <h1
          className="m-0 text-atelier-ink"
          style={{
            fontFamily: "var(--at-serif)",
            fontSize: 32,
            fontWeight: 400,
            marginTop: 4,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          <em style={{ fontStyle: "var(--at-italic-style, italic)" }}>{items.length}</em>{" "}
          {labels.conversations}
        </h1>
        <div className="flex gap-2 mt-3">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="uppercase"
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  padding: "6px 11px",
                  background: active ? "var(--at-ink)" : "transparent",
                  color: active ? "var(--at-cream)" : "var(--at-ink)",
                  border: active ? "1px solid var(--at-ink)" : "1px solid var(--at-line)",
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-atelier-muted"
            style={{ padding: "16px 24px", fontFamily: "var(--at-serif)", fontSize: 13 }}
          >
            <span className="inline-block h-4 w-4 animate-spin rounded-full border border-atelier-line border-t-atelier-ink" />
            {labels.loading}
          </div>
        ) : error ? (
          <div
            className="text-atelier-pourpre"
            style={{ padding: "16px 24px", fontFamily: "var(--at-serif)", fontSize: 13 }}
          >
            {labels.error}
          </div>
        ) : visible.length === 0 ? (
          <div
            className="text-atelier-muted"
            style={{
              padding: "24px",
              fontFamily: "var(--at-serif)",
              fontStyle: "var(--at-italic-style, italic)",
              fontSize: 13,
            }}
          >
            {labels.empty}
          </div>
        ) : (
          visible.map((thread) => {
            const name = buildDisplayName(thread.partner);
            const tone = toneFor(thread.partnerId);
            const hasUnread = thread.unread > 0;
            const isActive = thread.partnerId === activePartnerId;
            return (
              <button
                key={thread.partnerId}
                type="button"
                onClick={() => onSelect(thread.partnerId)}
                className="flex w-full items-start gap-3.5 text-left border-b border-atelier-line transition-colors"
                style={{
                  padding: "14px 24px",
                  background: isActive ? "var(--at-cream)" : "transparent",
                  borderLeft: isActive
                    ? "2px solid var(--at-terre)"
                    : "2px solid transparent",
                }}
                aria-current={isActive ? "true" : undefined}
              >
                <div className="relative shrink-0">
                  <Avatar
                    src={thread.partnerAvatar || undefined}
                    alt={name}
                    initial={thread.partnerAvatar ? undefined : initialOf(name)}
                    tone={tone}
                    size="md"
                  />
                  {hasUnread ? (
                    <span
                      aria-hidden="true"
                      className="absolute rounded-full"
                      style={{
                        top: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        background: "var(--at-terre)",
                        border: "2px solid var(--at-paper)",
                      }}
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div
                      className="text-atelier-ink truncate"
                      style={{
                        fontFamily: "var(--at-serif)",
                        fontSize: 16,
                        fontWeight: hasUnread ? 600 : 500,
                      }}
                    >
                      {name}
                    </div>
                    <div
                      className="text-atelier-muted shrink-0 uppercase"
                      style={{
                        fontFamily: "var(--at-mono)",
                        fontSize: 9,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {formatTime(thread.lastMessage.createdAt)}
                    </div>
                  </div>
                  <div
                    className="text-atelier-terre"
                    style={{
                      fontFamily: "var(--at-serif)",
                      fontSize: 12,
                      fontStyle: "var(--at-italic-style, italic)",
                      marginTop: 1,
                    }}
                  >
                    {labels.lastActive}
                  </div>
                  <div
                    className="line-clamp-1"
                    style={{
                      fontSize: 12.5,
                      color: hasUnread ? "var(--at-ink)" : "var(--at-muted)",
                      marginTop: 4,
                      lineHeight: 1.35,
                    }}
                  >
                    {truncate(thread.lastMessage.content, 90)}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
