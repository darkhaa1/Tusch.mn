import type { ListingUser, Message } from "../lib/api";

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
