"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCheck } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import { Badge } from "@repo/ui";
import { PageHeader } from "../../components/common";
import {
  useConversation,
  useCurrentUser,
  useMarkMessageRead,
  useMessageThreads,
  useSendMessage,
  useUsers,
} from "../hooks/useApi";
import type { Message } from "../lib/api/types";
import resolveImageUrl from "../lib/resolveImageUrl";
import { ThreadList } from "./components/ThreadList";
import { MobileThreadList } from "./components/MobileThreadList";
import { ConversationPanel } from "./components/ConversationPanel";
import { formatTime } from "./components/utils";
import type { ConversationMessage, ThreadItem } from "./types";

const quickReplies = ["Сайн байна уу!", "Хариу өгсөнд баярлалаа.", "Би удахгүй дахин холбогдоно.", "Дэлгэрэнгүй мэдээлэл хуваалцаарай."];

function getPartnerId(message: Message, currentUserId?: string) {
  if (!currentUserId) return null;
  return message.senderId === currentUserId ? message.recipientId : message.senderId;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
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
    return threads.map<ThreadItem>((threadMessage) => {
      const partnerId = getPartnerId(threadMessage, currentUser.id) || threadMessage.recipientId;
      const partnerFromMessage =
        threadMessage.senderId === currentUser.id ? threadMessage.recipient : threadMessage.sender;
      const partner = users?.find((user) => user.id === partnerId) || partnerFromMessage || undefined;
      const unread = threadMessage.recipientId === currentUser.id && !threadMessage.readAt ? 1 : 0;
      const partnerAvatar = resolveImageUrl(partner?.avatarUrl);

      return { partnerId, partner, partnerAvatar, lastMessage: threadMessage, unread };
    });
  }, [threads, users, currentUser]);

  const activeThread = threadItems.find((thread) => thread.partnerId === activePartnerId);
  const activeListingId =
    activeThread?.lastMessage.listingId || conversation?.[conversation.length - 1]?.listingId || null;

  const conversationMessages: ConversationMessage[] = useMemo(() => {
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

  useEffect(() => {
    const partnerFromQuery = searchParams.get("partnerId");
    if (partnerFromQuery) {
      setActivePartnerId(partnerFromQuery);
    }
  }, [searchParams]);

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
          <ThreadList
            items={threadItems}
            isLoading={isLoadingThreads}
            error={threadsError}
            activePartnerId={activePartnerId}
            onSelect={handleSelectConversation}
          />

          {mobileShowList ? (
            <MobileThreadList items={threadItems} isLoading={isLoadingThreads} onSelect={handleSelectConversation} />
          ) : null}

          {activePartnerId ? (
            <ConversationPanel
              activeThread={activeThread}
              activeListingId={activeListingId}
              conversationMessages={conversationMessages}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              isSending={isSending}
              isLoading={isLoadingConversation}
              sendError={sendError}
              quickReplies={quickReplies}
              onSelectReply={setDraft}
              onBackMobile={() => setActivePartnerId(null)}
            />
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
