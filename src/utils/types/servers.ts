export enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST",
}

export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

export interface User {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
  servers: Server[];
  members: Member[];
  channels: Channel[];
  createdAt: string;
  updatedAt: string;
}

export interface Server {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  userId: string;
  user: User;
  members: Member[];
  channels: Channel[];
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  role: MemberRole;
  userId: string;
  user: User;
  serverId: string;
  server: Server;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  userId: string;
  user: User;
  serverId: string;
  server: Server;
  createdAt: string;
  updatedAt: string;
}

export type ServerWithMembersWithUsersAndChannels = Server & {
  members: (Member & { user: User })[];
  channels: Channel[];
};

export type ServerWithMembersAndChannels = Server & {
  members: Member[];
  channels: Channel[];
};

export type MembersWithUser = (Member & { user: User })[];
