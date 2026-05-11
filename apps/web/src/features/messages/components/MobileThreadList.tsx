/**
 * Atelier Mobile Thread List.
 * Mirrors atelier.jsx 532-586:
 *   mono caps eyebrow "ЗУРВАС" → 36px serif headline with italic count → chip filter
 *   row (Бүгд / Уншаагүй / Саналтай) → thread rows with 44px round avatar,
 *   absolute terre unread dot, serif name, italic terre service line, clamped
 *   last-message line.
 *
 * Client component (selection callback). All copy local in `labels` —
 * project rule: no central i18n edits in this refactor.
 */
"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@web/components/ui-v2";
import type { PlaceholderTone } from "@web/components/ui-v2";
import type { ThreadItem } from "../types";
import { formatTime, truncate, buildDisplayName } from "./utils";

const labels = {
  eyebrow: "ЗУРВАС",
  conversations: "яриа",
  filterAll: "Бүгд",
  filterUnread: "Уншаагүй",
  filterOffers: "Саналтай",
  empty: "Одоогоор зурвас алга.",
  loading: "Зурвасуудыг ачаалж байна…",
  serviceFallback: "Үйлчилгээ",
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

type MobileThreadListProps = {
  items: ThreadItem[];
  isLoading: boolean;
  onSelect: (partnerId: string) => void;
};

export function MobileThreadList({ items, isLoading, onSelect }: MobileThreadListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((t) => t.unread > 0);
    if (filter === "offers") return items; // server-side offers flag not in data contract yet
    return items;
  }, [items, filter]);

  const count = items.length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: labels.filterAll },
    { key: "unread", label: labels.filterUnread },
    { key: "offers", label: labels.filterOffers },
  ];

  return (
    <div className="md:hidden flex flex-col bg-atelier-paper">
      {/* Eyebrow + headline */}
      <div style={{ padding: "6px 22px 16px" }}>
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
            fontSize: 36,
            fontWeight: 400,
            marginTop: 4,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          <em style={{ fontStyle: "var(--at-italic-style, italic)" }}>{count}</em> {labels.conversations}
        </h1>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2" style={{ padding: "0 22px 14px" }}>
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

      {/* Thread list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-atelier-muted"
            style={{ padding: "16px 22px", fontFamily: "var(--at-serif)", fontSize: 13 }}
          >
            <span className="inline-block h-4 w-4 animate-spin rounded-full border border-atelier-line border-t-atelier-ink" />
            {labels.loading}
          </div>
        ) : visible.length === 0 ? (
          <div
            className="text-atelier-muted"
            style={{
              padding: "24px 22px",
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
            return (
              <button
                key={thread.partnerId}
                type="button"
                onClick={() => onSelect(thread.partnerId)}
                className="flex w-full items-start gap-3.5 text-left border-t border-atelier-line hover:bg-atelier-cream/40"
                style={{ padding: "14px 22px" }}
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
                    {truncate(thread.lastMessage.content, 80)}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
