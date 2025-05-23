import { Channel, ChannelType, ServerWithMembersWithUsersAndChannels, User } from "@/utils/types/servers";
import {create} from "zustand";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage" | "editUser" | "createConversation";

interface ModalData {
	server? : ServerWithMembersWithUsersAndChannels;
	channel?: Channel;
	channelType?: ChannelType;
	user?: User;
	apiUrl?: string;
	query?: Record<string, any>;
}

interface ModalStore{
	type: ModalType | null;
	data: ModalData;
	isOpen: boolean;
	onOpen: (type: ModalType, data?: ModalData) => void;
	onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
	type: null,
	data: {},
	isOpen: false,
	onOpen: (type, data = {}) => set({isOpen: true, type, data}),
	onClose: () => set({isOpen: false,  type: null})
}));