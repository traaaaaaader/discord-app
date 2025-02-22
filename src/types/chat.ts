export enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST"
}

export interface User {
  id: string;
  name: string;
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  role: MemberRole;
  userId: string;
  user: User;
  messages: Message[];
  directMessages: DirectMessage[];
  conversationsInitiated: Conversation[];
  conversationsReceived: Conversation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  memberId: string;
  member: Member;
  channelId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  memberOneId: string;
  memberOne: Member;
  memberTwoId: string;
  memberTwo: Member;
  directMessages: DirectMessage[];
}

export interface DirectMessage {
  id: string;
  content: string;
  fileUrl: string | null;
  memberId: string;
  member: Member;
  conversationId: string;
  conversation: Conversation;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}