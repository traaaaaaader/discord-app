import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MemberRole } from "@/utils/types/servers";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";

import { useModal } from "@/hooks/use-modal-store";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MembersService } from "@/services";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

export const MembersModal = () => {
  const navigate = useNavigate();
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const [loadingId, setLoadingId] = useState("");

  const isModalOpen = isOpen && type === "members";
  const { server } = data;

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      if (!server || !server?.id) {
        throw new Error("Server ID is required to edit a channel.");
      }
      console.log(memberId, server.id);
      const response = await MembersService.deleteMember(memberId, server.id);

      navigate(0);
      onOpen("members", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      if (!server || !server?.id) {
        throw new Error("Server ID is required to edit a channel.");
      }
      const response = await MembersService.updateMember(
        server.id,
        memberId,
        role
      );

      navigate(0);
      onOpen("members", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar src={member.user?.imageUrl} />
              <div className="fles flex-col gap-y-1">
                <div className="text-xs font-serif flex items-center gap-x-1">
                  {member.user?.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-zinc-500">{member.user?.email}</p>
              </div>
              {server.userId !== member.userId && loadingId !== member.id && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-5 w-5 text-zinc-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center">
                          <ShieldQuestion className="w-4 h-4 mr-2" />
                          <span>Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                onRoleChange(member.id, MemberRole.GUEST)
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Guest
                              {member.role === "GUEST" && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onRoleChange(member.id, MemberRole.MODERATOR)
                              }
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              MODERATOR
                              {member.role === "MODERATOR" && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onKick(member.id)}>
                        <Gavel className="h-4 w-4 mr-2" />
                        Kick
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
