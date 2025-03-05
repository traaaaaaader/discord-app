export enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST",
}

export interface User {
  id: string;
  name: string;
  imageUrl: string;
  members: Member[];
  conversationsInitiated: Conversation[];
  conversationsReceived: Conversation[];
  conversationMessages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}
export interface Member {
  id: string;
  role: MemberRole;
  userId: string;
  user: User;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
export interface Message {
  id: string;
  content: string;
  fileUrl?: string | null;
  memberId: string;
  member: Member;
  channelId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userOneId: string;
  userOne: User;
  userTwoId: string;
  userTwo: User;
  conversationMessages: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  content: string;
  fileUrl?: string | null;
  conversationId: string;
  conversation: Conversation;
  senderId: string;
  sender: User;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}