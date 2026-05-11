/**
 * Atelier Messages — orchestrator (client).
 *
 * Mobile:  state machine. List view → tap a thread → conversation view.
 *          Back arrow inside ConversationPanel returns to the list.
 * Desktop: 2-column layout under the global DesktopNav. Left rail = ThreadList
 *          (max 400px), right pane = ConversationPanel. Empty state if no
 *          partner selected.
 *
 * All data hooks (useMessageThreads, useConversation, useSendMessage,
 * useMarkMessageRead) and event handlers are preserved 1:1 from the previous
 * implementation — only the rendering layer is rewritten for Atelier.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const labels = {
  authRequired: "Зурвас үзэхийн тулд нэвтэрнэ үү.",
  selectThreadEyebrow: "ЗУРВАС",
  selectThreadTitle: "Яриа сонгоно уу",
  selectThreadHint:
    "Зүүн талын жагсаалтаас яриа сонгож, харилцагчтайгаа холбогдоорой.",
  quickReply1: "Сайн уу, ажил эхэлж болох уу?",
  quickReply2: "Үнэлгээгээ илгээгээрэй.",
  quickReply3: "Маргааш өглөө уулзаж болох уу?",
  quickReply4: "Баярлалаа.",
};

function getPartnerId(message: Message, currentUserId?: string) {
  if (!currentUserId) return null;
  return message.senderId === currentUserId ? message.recipientId : message.senderId;
}

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const [activePartnerId, setActivePartnerId] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState("");

  const quickReplies = useMemo(
    () => [labels.quickReply1, labels.quickReply2, labels.quickReply3, labels.quickReply4],
    [],
  );

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
    activePartnerId === undefined ? (partnerFromQuery ?? autoPartnerId) : activePartnerId;

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversation(resolvedActivePartnerId || undefined);

  const conversation = useMemo(() => {
    if (!conversationData?.pages) return undefined;
    return conversationData.pages.flatMap((p) => p.items).reverse();
  }, [conversationData]);
  const {
    mutate: sendMessageMutate,
    isPending: isSending,
    error: sendError,
  } = useSendMessage();
  const { mutate: markMessageReadMutate, isPending: isMarkingRead } = useMarkMessageRead();

  const threadItems = useMemo(() => {
    if (!threads || !currentUser) return [];
    return threads.map<ThreadItem>((threadMessage) => {
      const partnerId =
        getPartnerId(threadMessage, currentUser.id) || threadMessage.recipientId;
      const partnerFromMessage =
        threadMessage.senderId === currentUser.id
          ? threadMessage.recipient
          : threadMessage.sender;
      const partner =
        users?.find((user) => user.id === partnerId) || partnerFromMessage || undefined;
      const unread =
        threadMessage.recipientId === currentUser.id && !threadMessage.readAt ? 1 : 0;
      const partnerAvatar = resolveImageUrl(partner?.avatarUrl);

      return { partnerId, partner, partnerAvatar, lastMessage: threadMessage, unread };
    });
  }, [threads, users, currentUser]);

  const activeThread = threadItems.find(
    (thread) => thread.partnerId === resolvedActivePartnerId,
  );
  const activeListingId =
    activeThread?.lastMessage.listingId ||
    conversation?.[conversation.length - 1]?.listingId ||
    null;

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
      markMessageReadMutate({
        messageId: lastIncoming.id,
        partnerId: resolvedActivePartnerId,
      });
    }
  }, [
    conversation,
    currentUser,
    resolvedActivePartnerId,
    markMessageReadMutate,
    isMarkingRead,
  ]);

  const handleSelectConversation = (partnerId: string) => {
    setActivePartnerId(partnerId);
    setDraft("");
  };

  const handleSend = () => {
    if (!draft.trim() || !resolvedActivePartnerId || !activeListingId) return;
    const content = draft.trim();
    sendMessageMutate(
      { recipientId: resolvedActivePartnerId, listingId: activeListingId, content },
      { onSuccess: () => setDraft("") },
    );
  };

  const mobileShowList = !resolvedActivePartnerId;
  const showAuthRequired = !isUserLoading && !currentUser;

  // Reserve space under DesktopNav (76px) on desktop; full screen on mobile.
  // pb-20 leaves room for MobileTabBar.
  const containerHeight = "md:h-[calc(100vh-76px)] min-h-[calc(100vh-76px)]";

  if (showAuthRequired) {
    return (
      <div className={`bg-atelier-paper ${containerHeight} pb-20 md:pb-0`}>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <div
            className="uppercase text-atelier-muted mb-2"
            style={{ fontFamily: "var(--at-mono)", fontSize: 10, letterSpacing: "0.2em" }}
          >
            {labels.selectThreadEyebrow}
          </div>
          <p
            className="text-atelier-ink"
            style={{
              fontFamily: "var(--at-serif)",
              fontStyle: "var(--at-italic-style, italic)",
              fontSize: 18,
            }}
          >
            {labels.authRequired}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-atelier-paper ${containerHeight} pb-20 md:pb-0 overflow-hidden`}
    >
      {/* Desktop: 2-col grid (thread list 400px / conversation flex-1). */}
      <div className="hidden md:grid h-full" style={{ gridTemplateColumns: "minmax(280px, 400px) 1fr" }}>
        <ThreadList
          items={threadItems}
          isLoading={isLoadingThreads}
          error={threadsError}
          activePartnerId={resolvedActivePartnerId}
          onSelect={handleSelectConversation}
        />
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
          <div className="flex flex-col items-center justify-center bg-atelier-paper px-8 text-center">
            <div
              className="uppercase text-atelier-muted mb-2"
              style={{ fontFamily: "var(--at-mono)", fontSize: 10, letterSpacing: "0.2em" }}
            >
              {labels.selectThreadEyebrow}
            </div>
            <h2
              className="m-0 text-atelier-ink"
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 28,
                fontWeight: 400,
                fontStyle: "var(--at-italic-style, italic)",
                letterSpacing: "-0.02em",
              }}
            >
              {labels.selectThreadTitle}
            </h2>
            <p
              className="mt-3 max-w-sm text-atelier-muted"
              style={{ fontFamily: "var(--at-serif)", fontSize: 14, lineHeight: 1.5 }}
            >
              {labels.selectThreadHint}
            </p>
          </div>
        )}
      </div>

      {/* Mobile: single-pane state machine. */}
      <div className="md:hidden h-full">
        {mobileShowList ? (
          <MobileThreadList
            items={threadItems}
            isLoading={isLoadingThreads}
            onSelect={handleSelectConversation}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
