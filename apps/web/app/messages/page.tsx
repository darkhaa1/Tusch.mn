"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCheck, Loader2, Paperclip } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import { Badge, Button, Input, Avatar } from "@repo/ui";
import { PageHeader } from "../../components/common";
import {
  useConversation,
  useCurrentUser,
  useMarkMessageRead,
  useMessageThreads,
  useSendMessage,
  useUsers,
} from "../hooks/useApi";
import type { ListingUser, Message } from "../lib/api";
import { cn } from "../lib/utils";
import resolveImageUrl from "../lib/resolveImageUrl";

const quickReplies = [
  "Сайн байна уу!",
  "Хариу өгсөнд баярлалаа.",
  "Би удахгүй дахин холбогдоно.",
  "Дэлгэрэнгүй мэдээлэл хуваалцаарай.",
];

function formatTime(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return value;
  }
}

function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function buildDisplayName(user?: ListingUser) {
  if (!user) return "Хэрэглэгч";
  return `${user.firstName} ${user.lastName}`.trim();
}

function getPartnerId(message: Message, currentUserId?: string) {
  if (!currentUserId) return null;
  return message.senderId === currentUserId ? message.recipientId : message.senderId;
}

export default function MessagesPage() {
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: users } = useUsers(Boolean(currentUser));
  const {
    data: threads,
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useMessageThreads(Boolean(currentUser));
  const {
    data: conversation,
    isLoading: isLoadingConversation,
  } = useConversation(activePartnerId || undefined);
  const {
    mutate: sendMessageMutate,
    isPending: isSending,
    error: sendError,
  } = useSendMessage();
  const {
    mutate: markMessageReadMutate,
    isPending: isMarkingRead,
  } = useMarkMessageRead();

  useEffect(() => {
    if (!currentUser) return;

    const firstThread = threads?.[0];
    if (!firstThread) {
      setActivePartnerId(null);
      return;
    }

    if (!activePartnerId) {
      const firstPartner = getPartnerId(firstThread, currentUser.id);
      if (firstPartner) setActivePartnerId(firstPartner);
    }
  }, [threads, currentUser, activePartnerId]);

  const threadItems = useMemo(() => {
    if (!threads || !currentUser) return [];
    return threads.map((threadMessage) => {
      const partnerId = getPartnerId(threadMessage, currentUser.id) || threadMessage.recipientId;
      const partnerFromMessage =
        threadMessage.senderId === currentUser.id ? threadMessage.recipient : threadMessage.sender;
      const partner = users?.find((user) => user.id === partnerId) || partnerFromMessage || undefined;
      const unread = threadMessage.recipientId === currentUser.id && !threadMessage.readAt ? 1 : 0;

      return { partnerId, partner, lastMessage: threadMessage, unread };
    });
  }, [threads, users, currentUser]);

  const partnerAvatar = resolveImageUrl(threadItems[0]?.partner?.avatarUrl);
  console.log("threadItems", threadItems);
  const activeThread = threadItems.find((thread) => thread.partnerId === activePartnerId);
  const activeListingId =
    activeThread?.lastMessage.listingId || conversation?.[conversation.length - 1]?.listingId || null;

  const conversationMessages = useMemo(() => {
    if (!conversation || !currentUser) return [];
    return conversation.map((message) => ({
      ...message,
      fromMe: message.senderId === currentUser.id,
      formattedTime: formatTime(message.createdAt),
    }));
  }, [conversation, currentUser]);

  useEffect(() => {
    if (!conversation || !currentUser || !activePartnerId) return;
    const lastIncoming = [...conversation]
      .reverse()
      .find((message) => message.recipientId === currentUser.id && !message.readAt);
    if (lastIncoming && !isMarkingRead) {
      markMessageReadMutate({ messageId: lastIncoming.id, partnerId: activePartnerId });
    }
  }, [conversation, currentUser, activePartnerId, markMessageReadMutate, isMarkingRead]);

  const handleSelectConversation = (partnerId: string) => {
    setActivePartnerId(partnerId);
    setDraft("");
  };

  const handleSend = () => {
    if (!draft.trim() || !activePartnerId || !activeListingId) return;
    const content = draft.trim();
    sendMessageMutate(
      { recipientId: activePartnerId, listingId: activeListingId, content },
      { onSuccess: () => setDraft("") }
    );
  };

  const mobileShowList = !activePartnerId;
  const showAuthRequired = !isUserLoading && !currentUser;

  return (
    <AppShell>
      <PageHeader
        title="Мессежүүд"
        description="Платформаас гаралгүйгээр бусад хэрэглэгчидтэй ярилцаарай."
        actions={
          !mobileShowList ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Яриа
            </Badge>
          ) : null
        }
        className="mb-4"
      />

      {showAuthRequired ? (
        <div className="rounded-xl border border-border/80 bg-background p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Мессежээ харах, илгээхийн тулд нэвтэрнэ үү.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[320px_1fr] sm:gap-6">
          <div className="hidden rounded-xl border border-border/80 bg-background shadow-sm sm:block">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium text-foreground">Харилцаанууд</p>
              <p className="text-xs text-muted-foreground">Яриа бүрийн сүүлийн мессеж энд харагдана.</p>
            </div>
            <div className="divide-y">
              {isLoadingThreads ? (
                <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Харилцаануудыг ачааллаж байна...
                </div>
              ) : threadsError ? (
                <div className="px-4 py-4 text-sm text-red-600">Харилцаануудыг уншиж чадсангүй.</div>
              ) : threadItems.length ? (
                threadItems.map((thread) => {
                  const isActive = thread.partnerId === activePartnerId;
                  const name = buildDisplayName(thread.partner);
                  return (
                    <button
                      key={thread.partnerId}
                      type="button"
                      onClick={() => handleSelectConversation(thread.partnerId)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                        isActive ? "bg-primary/5" : "hover:bg-muted"
                      )}
                    >
                      <Avatar src={partnerAvatar || undefined} alt={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground line-clamp-1">{name}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(thread.lastMessage.createdAt)}</span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{truncate(thread.lastMessage.content)}</p>
                      </div>
                      {thread.unread ? (
                        <Badge className="h-6 min-w-[24px] justify-center rounded-full px-2 text-xs">
                          {thread.unread}
                        </Badge>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">Одоогоор яриа алга.</div>
              )}
            </div>
          </div>

          {mobileShowList ? (
            <div className="rounded-xl border border-border/80 bg-background shadow-sm sm:hidden">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-foreground">Харилцаанууд</p>
                <p className="text-xs text-muted-foreground">Яриа бүрийн сүүлийн мессеж энд харагдана.</p>
              </div>
              <div className="divide-y">
                {isLoadingThreads ? (
                  <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Харилцаануудыг ачааллаж байна...
                  </div>
                ) : threadItems.length ? (
                  threadItems.map((thread) => {
                    const name = buildDisplayName(thread.partner);
                    return (
                      <button
                        key={thread.partnerId}
                        type="button"
                        onClick={() => handleSelectConversation(thread.partnerId)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                      >
                        <Avatar src={thread.partnerAvatar || undefined} alt={name} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground line-clamp-1">{name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(thread.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{truncate(thread.lastMessage.content)}</p>
                        </div>
                        {thread.unread ? (
                          <Badge className="h-6 min-w-[24px] justify-center rounded-full px-2 text-xs">
                            {thread.unread}
                          </Badge>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-sm text-muted-foreground">Одоогоор яриа алга.</div>
                )}
              </div>
            </div>
          ) : null}

          {activePartnerId ? (
            <div className="relative flex h-[70vh] flex-col rounded-xl border border-border/80 bg-background shadow-sm">
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setActivePartnerId(null)}
                  aria-label="Жагсаалт руу буцах"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar src={activeThread?.partnerAvatar || undefined} alt={buildDisplayName(activeThread?.partner)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{buildDisplayName(activeThread?.partner)}</p>
                  <p className="text-xs text-muted-foreground">{activeThread?.partner?.email || "Харилцаа"}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {isLoadingConversation ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Яриаг ачааллаж байна...
                  </div>
                ) : conversationMessages.length ? (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex flex-col gap-1", message.fromMe ? "items-end" : "items-start")}
                    >
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
                  <p className="text-sm text-muted-foreground">Энэ ярианд мессеж алга.</p>
                )}
              </div>

              <div className="border-t bg-background px-4 py-3">
                <div className="mb-2 flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setDraft(reply)}
                      className="rounded-full border border-border/80 bg-muted px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                {sendError ? <p className="mb-2 text-xs text-red-600">{(sendError as Error).message}</p> : null}
                {!activeListingId ? (
                  <p className="mb-2 text-xs text-amber-600">
                    Энэ ярианд зар холбоогүй бол мессеж илгээх боломжгүй.
                  </p>
                ) : null}
                <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-2">
                  <Button variant="ghost" size="icon" className="shrink-0" disabled>
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Мессежээ бичнэ үү..."
                    className="h-10 flex-1 border-none bg-transparent focus-visible:ring-0"
                  />
                  <Button size="sm" onClick={handleSend} className="shrink-0" disabled={isSending || !activeListingId}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Илгээх"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-background p-6 text-sm text-muted-foreground shadow-sm">
              Эхлэхийн тулд нэг яриа сонгоно уу.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
