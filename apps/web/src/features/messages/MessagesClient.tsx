"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCheck } from "lucide-react";
import AppShell from "@web/components/layout/AppShell";
import { Badge } from "@web/components/ui";
import {
  useConversation,
  useCurrentUser,
  useMarkMessageRead,
  useMessageThreads,
  useSendMessage,
  useUsers,
} from "@web/lib/hooks/useApi";
import type { Message } from "@web/lib/api/types";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import { ThreadList } from "./components/ThreadList";
import { MobileThreadList } from "./components/MobileThreadList";
import { ConversationPanel } from "./components/ConversationPanel";
import { formatTime } from "./components/utils";
import type { ConversationMessage, ThreadItem } from "./types";

const quickReplies = [
  "Сайн байна уу!",
  "Танд тусламж хэрэгтэй юу?",
  "Үнийн талаар тохиролцож болох уу?",
  "Баярлалаа, удахгүй холбоо барья.",
];

function getPartnerId(message: Message, currentUserId?: string) {
  if (!currentUserId) return null;
  return message.senderId === currentUserId ? message.recipientId : message.senderId;
}

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const [activePartnerId, setActivePartnerId] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState("");

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: usersData } = useUsers(undefined, Boolean(currentUser));
  const users = usersData?.items;
  const {
    data: threads,
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useMessageThreads(Boolean(currentUser));
  const partnerFromQuery = searchParams.get("partnerId");
  const autoPartnerId = useMemo(() => {
    if (!currentUser) return null;
    const firstThread = threads?.[0];
    if (!firstThread) return null;
    return getPartnerId(firstThread, currentUser.id);
  }, [threads, currentUser]);
  const resolvedActivePartnerId =
    activePartnerId === undefined ? partnerFromQuery ?? autoPartnerId : activePartnerId;

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversation(resolvedActivePartnerId || undefined);

  // Flatten all pages into a single array; API returns newest-first per page
  const conversation = useMemo(() => {
    if (!conversationData?.pages) return undefined;
    // Each page has items in desc order; flatten all, then reverse so oldest is first
    return conversationData.pages.flatMap((p) => p.items).reverse();
  }, [conversationData]);
  const {
    mutate: sendMessageMutate,
    isPending: isSending,
    error: sendError,
  } = useSendMessage();
  const {
    mutate: markMessageReadMutate,
    isPending: isMarkingRead,
  } = useMarkMessageRead();

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

  const activeThread = threadItems.find((thread) => thread.partnerId === resolvedActivePartnerId);
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
    if (!conversation || !currentUser || !resolvedActivePartnerId) return;
    const lastIncoming = [...conversation]
      .reverse()
      .find((message) => message.recipientId === currentUser.id && !message.readAt);
    if (lastIncoming && !isMarkingRead) {
      markMessageReadMutate({ messageId: lastIncoming.id, partnerId: resolvedActivePartnerId });
    }
  }, [conversation, currentUser, resolvedActivePartnerId, markMessageReadMutate, isMarkingRead]);

  const handleSelectConversation = (partnerId: string) => {
    setActivePartnerId(partnerId);
    setDraft("");
  };

  const handleSend = () => {
    if (!draft.trim() || !resolvedActivePartnerId || !activeListingId) return;
    const content = draft.trim();
    sendMessageMutate(
      { recipientId: resolvedActivePartnerId, listingId: activeListingId, content },
      { onSuccess: () => setDraft("") }
    );
  };

  const mobileShowList = !resolvedActivePartnerId;
  const showAuthRequired = !isUserLoading && !currentUser;

  return (
    <AppShell
      title="Мессежүүд"
      description="Мессежүүдээ нэг дороос хянаж, хариулаарай."
      actions={
        !mobileShowList ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Уншсан
          </Badge>
        ) : null
      }
    >

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
            activePartnerId={resolvedActivePartnerId}
            onSelect={handleSelectConversation}
          />

          {mobileShowList ? (
            <MobileThreadList items={threadItems} isLoading={isLoadingThreads} onSelect={handleSelectConversation} />
          ) : null}

          {resolvedActivePartnerId ? (
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
              hasOlderMessages={!!hasNextPage}
              isLoadingOlder={isFetchingNextPage}
              onLoadOlder={() => fetchNextPage()}
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-background p-6 text-sm text-muted-foreground shadow-sm">
              Яриа эхлүүлэхийн тулд хэрэглэгч сонгоно уу.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
