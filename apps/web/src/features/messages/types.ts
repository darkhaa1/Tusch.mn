import type { ListingUser, Message } from "@web/lib/api/types";

export type ThreadItem = {
  partnerId: string;
  partner?: ListingUser;
  partnerAvatar?: string | null;
  lastMessage: Message;
  unread: number;
};

export type ConversationMessage = Message & {
  fromMe: boolean;
  formattedTime: string;
};
