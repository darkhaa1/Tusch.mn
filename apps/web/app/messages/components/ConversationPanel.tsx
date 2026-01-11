"use client";

import Link from "next/link";
import { ArrowLeft, CheckCheck, Loader2, Paperclip } from "lucide-react";
import { Avatar, Button, Input } from "@repo/ui";
import type { ConversationMessage, ThreadItem } from "../types";
import { cn } from "../../lib/utils";
import { buildDisplayName } from "./utils";

type ConversationPanelProps = {
  activeThread?: ThreadItem;
  activeListingId: string | null;
  conversationMessages: ConversationMessage[];
  draft: string;
  // eslint-disable-next-line no-unused-vars
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  isLoading: boolean;
  sendError?: unknown;
  quickReplies: string[];
  // eslint-disable-next-line no-unused-vars
  onSelectReply: (reply: string) => void;
  onBackMobile: () => void;
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
}: ConversationPanelProps) {
  return (
    <div className="relative flex h-[70vh] flex-col rounded-xl border border-border/80 bg-background shadow-sm">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onBackMobile} aria-label="Ð–Ð°Ð³ÑÐ°Ð°Ð»Ñ‚ Ñ€ÑƒÑƒ Ð±ÑƒÑ†Ð°Ñ…">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Link
          href={`/u/${activeThread?.partnerId ?? ""}`}
          prefetch={false}
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar src={activeThread?.partnerAvatar || undefined} alt={buildDisplayName(activeThread?.partner)} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{buildDisplayName(activeThread?.partner)}</p>
            <p className="text-xs text-muted-foreground">ÐŸÑ€Ð¾Ñ„Ð°Ð¹Ð» Ñ€ÑƒÑƒ Ð¾Ñ‡Ð¸Ñ…</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ð¯Ñ€Ð¸Ð°Ð³ Ð°Ñ‡Ð°Ð°Ð»Ð»Ð°Ð¶ Ð±Ð°Ð¹Ð½Ð°...
          </div>
        ) : conversationMessages.length ? (
          conversationMessages.map((message) => (
            <div key={message.id} className={cn("flex flex-col gap-1", message.fromMe ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  message.fromMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                {message.content}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{message.formattedTime}</span>
                {message.fromMe ? <CheckCheck className="h-3 w-3" aria-hidden="true" /> : null}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Ð­Ð½Ñ ÑÑ€Ð¸Ð°Ð½Ð´ Ð¼ÐµÑÑÐµÐ¶ Ð°Ð»Ð³Ð°.</p>
        )}
      </div>

      <div className="border-t bg-background px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSelectReply(reply)}
              className="rounded-full border border-border/80 bg-muted px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary"
            >
              {reply}
            </button>
          ))}
        </div>
        {sendError ? <p className="mb-2 text-xs text-red-600">{(sendError as Error).message}</p> : null}
        {!activeListingId ? (
          <p className="mb-2 text-xs text-amber-600">Ð­Ð½Ñ ÑÑ€Ð¸Ð°Ð½Ð´ Ð·Ð°Ñ€ Ñ…Ð¾Ð»Ð±Ð¾Ð¾Ð³Ò¯Ð¹ Ð±Ð¾Ð» Ð¼ÐµÑÑÐµÐ¶ Ð¸Ð»Ð³ÑÑÑ… Ð±Ð¾Ð»Ð¾Ð¼Ð¶Ð³Ò¯Ð¹.</p>
        ) : null}
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-2">
          <Button variant="ghost" size="icon" className="shrink-0" disabled>
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="ÐœÐµÑÑÐµÐ¶ÑÑ Ð±Ð¸Ñ‡Ð½Ñ Ò¯Ò¯..."
            className="h-10 flex-1 border-none bg-transparent focus-visible:ring-0"
          />
          <Button size="sm" onClick={onSend} className="shrink-0" disabled={isSending || !activeListingId}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ð˜Ð»Ð³ÑÑÑ…"}
          </Button>
        </div>
      </div>
    </div>
  );
}

