import { useEffect, useState } from "react";

import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { CreateConversationModal } from "@/components/modals/create-conversation-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateChannelModal/>
      <CreateConversationModal/>
      <CreateServerModal />
      <DeleteChannelModal/>
      <DeleteMessageModal/>
      <DeleteServerModal/>
      <EditChannelModal/>
      <EditServerModal/>
      <EditUserModal/>
      <InviteModal/>
      <LeaveServerModal/>
      <MembersModal/>
    </>
  );
};
