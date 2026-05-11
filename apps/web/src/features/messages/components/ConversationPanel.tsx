/**
 * Atelier Conversation Panel.
 *
 * Mobile: full-screen view (atelier.jsx 588-650) — back arrow + avatar header,
 * paper-bg message thread with cream incoming / ink outgoing flat bubbles,
 * mono caps date separator, and bottom composer (+ button + italic placeholder).
 *
 * Desktop: same elements with extra breathing room (larger avatar, wider
 * composer, no back arrow). Adaptation per SA-7 brief — no design source.
 *
 * Data flow: receives messages + handlers from MessagesClient; no mutations
 * or queries here.
 */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Loader2, Plus } from "lucide-react";
import { Avatar } from "@web/components/ui-v2";
import type { PlaceholderTone } from "@web/components/ui-v2";
import type { ConversationMessage, ThreadItem } from "../types";
import { buildDisplayName } from "./utils";

const labels = {
  back: "Жагсаалт руу буцах",
  loading: "Зурвасуудыг ачаалж байна…",
  empty: "Энд хоосон байна. Эхний зурвасаа бичээрэй.",
  composer: "Зурвас бичих…",
  send: "Илгээх",
  attach: "Хавсралт",
  noListing: "Энэ ярианд холбогдсон зар алга — зурвас илгээх боломжгүй.",
  emailNotVerified: "Имэйлээ баталгаажуулсны дараа зурвас бичих боломжтой.",
  loadOlder: "Өмнөх зурвасууд",
  serviceFallback: "Үйлчилгээ",
  lastActive: "Сүүлд идэвхтэй",
  more: "Дэлгэрэнгүй",
  read: "Уншсан",
};

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

const DATE_FMT_MN = new Intl.DateTimeFormat("mn-MN", {
  weekday: "short",
  day: "numeric",
  month: "long",
});

function formatDateSeparator(iso: string): string {
  try {
    return DATE_FMT_MN.format(new Date(iso)).toUpperCase();
  } catch {
    return "";
  }
}

function dayKey(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

type ConversationPanelProps = {
  activeThread?: ThreadItem;
  activeListingId: string | null;
  conversationMessages: ConversationMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  isLoading: boolean;
  sendError?: unknown;
  quickReplies: string[];
  onSelectReply: (reply: string) => void;
  onBackMobile: () => void;
  hasOlderMessages?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
};

export function ConversationPanel({
  activeThread,
  activeListingId,
  conversationMessages,
  draft,
  onDraftChange,
  onSend,
  isSending,
  isLoading,
  sendError,
  quickReplies,
  onSelectReply,
  onBackMobile,
  hasOlderMessages,
  isLoadingOlder,
  onLoadOlder,
}: ConversationPanelProps) {
  const sendErrorMessage = sendError instanceof Error ? sendError.message : undefined;
  const isEmailVerificationError = sendErrorMessage === "Имэйл баталгаажуулна уу";

  const name = buildDisplayName(activeThread?.partner);
  const partnerId = activeThread?.partnerId ?? "";
  const tone = toneFor(partnerId || name);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversationMessages.length, partnerId]);

  return (
    <section className="flex h-full min-h-0 flex-col bg-atelier-paper">
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b border-atelier-line bg-atelier-paper"
        style={{ padding: "10px 18px 12px" }}
      >
        <button
          type="button"
          onClick={onBackMobile}
          aria-label={labels.back}
          className="md:hidden -ml-1 inline-flex h-8 w-8 items-center justify-center text-atelier-ink"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
        </button>
        <Link
          href={partnerId ? `/u/${partnerId}` : "#"}
          prefetch={false}
          className="flex flex-1 items-center gap-3 min-w-0"
          onClick={(e) => {
            if (!partnerId) e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Avatar
            src={activeThread?.partnerAvatar || undefined}
            alt={name}
            initial={activeThread?.partnerAvatar ? undefined : initialOf(name)}
            tone={tone}
            size="md"
            className="md:hidden"
          />
          <Avatar
            src={activeThread?.partnerAvatar || undefined}
            alt={name}
            initial={activeThread?.partnerAvatar ? undefined : initialOf(name)}
            tone={tone}
            size="lg"
            className="hidden md:block"
          />
          <div className="min-w-0">
            <div
              className="truncate text-atelier-ink"
              style={{ fontFamily: "var(--at-serif)", fontSize: 15, fontWeight: 500 }}
            >
              {name}
            </div>
            <div
              className="truncate text-atelier-terre"
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 11,
                fontStyle: "var(--at-italic-style, italic)",
              }}
            >
              {labels.lastActive}
            </div>
          </div>
        </Link>
        <span
          aria-hidden="true"
          className="text-atelier-muted shrink-0 select-none"
          style={{ fontSize: 18 }}
          title={labels.more}
        >
          ⋯
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "var(--at-paper)",
        }}
      >
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-atelier-muted"
            style={{ fontFamily: "var(--at-serif)", fontSize: 13 }}
          >
            <Loader2 size={14} className="animate-spin" />
            {labels.loading}
          </div>
        ) : conversationMessages.length === 0 ? (
          <div
            className="text-atelier-muted text-center"
            style={{
              fontFamily: "var(--at-serif)",
              fontStyle: "var(--at-italic-style, italic)",
              fontSize: 13,
              padding: "24px 0",
            }}
          >
            {labels.empty}
          </div>
        ) : (
          <>
            {hasOlderMessages ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onLoadOlder}
                  disabled={isLoadingOlder}
                  className="uppercase text-atelier-muted hover:text-atelier-ink disabled:opacity-50"
                  style={{
                    fontFamily: "var(--at-mono)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    padding: "6px 11px",
                    border: "1px solid var(--at-line)",
                  }}
                >
                  {isLoadingOlder ? (
                    <Loader2 size={11} className="mr-1 inline-block animate-spin" />
                  ) : null}
                  {labels.loadOlder}
                </button>
              </div>
            ) : null}

            {conversationMessages.map((message, idx) => {
              const prev = conversationMessages[idx - 1];
              const showDate = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt);
              return (
                <div key={message.id} className="flex flex-col gap-1">
                  {showDate ? (
                    <div
                      className="text-center uppercase text-atelier-muted my-1"
                      style={{
                        fontFamily: "var(--at-mono)",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                      }}
                    >
                      {formatDateSeparator(message.createdAt)} · {message.formattedTime}
                    </div>
                  ) : null}
                  <div
                    className={message.fromMe ? "self-end" : "self-start"}
                    style={{ maxWidth: "78%" }}
                  >
                    <div
                      style={{
                        background: message.fromMe ? "var(--at-ink)" : "var(--at-cream)",
                        color: message.fromMe ? "var(--at-cream)" : "var(--at-ink)",
                        padding: "11px 14px",
                        fontFamily: "var(--at-serif)",
                        fontSize: 13.5,
                        lineHeight: 1.45,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`mt-1 flex items-center gap-1 ${
                        message.fromMe ? "justify-end" : "justify-start"
                      } text-atelier-muted`}
                      style={{
                        fontFamily: "var(--at-mono)",
                        fontSize: 9,
                        letterSpacing: "0.1em",
                      }}
                    >
                      <span>{message.formattedTime}</span>
                      {message.fromMe && message.readAt ? (
                        <CheckCheck
                          size={11}
                          aria-label={labels.read}
                          className="text-atelier-terre"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Composer */}
      <div
        className="border-t border-atelier-line bg-atelier-paper"
        style={{ padding: "10px 14px 12px" }}
      >
        {quickReplies.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => onSelectReply(reply)}
                className="uppercase text-atelier-ink hover:bg-atelier-cream/60"
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  padding: "6px 11px",
                  border: "1px solid var(--at-line)",
                  background: "transparent",
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        {sendErrorMessage ? (
          <p
            className={`mb-2 ${
              isEmailVerificationError ? "text-atelier-ocre" : "text-atelier-pourpre"
            }`}
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 11,
              letterSpacing: "0.05em",
            }}
          >
            {isEmailVerificationError ? labels.emailNotVerified : sendErrorMessage}
          </p>
        ) : null}

        {!activeListingId ? (
          <p
            className="mb-2 text-atelier-ocre"
            style={{ fontFamily: "var(--at-mono)", fontSize: 11, letterSpacing: "0.05em" }}
          >
            {labels.noListing}
          </p>
        ) : null}

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled
            aria-label={labels.attach}
            className="shrink-0 inline-flex items-center justify-center rounded-full border border-atelier-line text-atelier-ink disabled:opacity-50"
            style={{ width: 34, height: 34 }}
          >
            <Plus size={16} strokeWidth={1.6} />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={labels.composer}
            disabled={!activeListingId}
            className="flex-1 bg-atelier-paper text-atelier-ink placeholder:italic placeholder:text-atelier-muted outline-none disabled:opacity-50"
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 13,
              padding: "10px 14px",
              border: "1px solid var(--at-line)",
            }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={isSending || !activeListingId || !draft.trim()}
            className="shrink-0 inline-flex items-center justify-center bg-atelier-ink text-atelier-cream disabled:opacity-50"
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 13,
              padding: "10px 16px",
              border: "1px solid var(--at-ink)",
            }}
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              labels.send
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
