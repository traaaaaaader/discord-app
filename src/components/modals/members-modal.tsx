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
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      if (!server || !server?.id) {
        throw new Error("Server ID is required to edit a channel.");
      }

      const response = await MembersService.deleteMember(
        memberId, 
        server.id,
        accessToken
      );

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
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      if (!server || !server?.id) {
        throw new Error("Server ID is required to edit a channel.");
      }

      const response = await MembersService.updateMember(
        server.id,
        memberId,
        role,
        accessToken
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
      <DialogContent className="bg-card text-foreground overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Управление участниками
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {server?.members?.length} Участника
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar src={member.user?.imageUrl} />
              <div className="fles flex-col gap-y-1">
                <div className="text-md font-serif flex items-center gap-x-1">
                  {member.user?.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
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
                          <span>Роль</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                onRoleChange(member.id, MemberRole.GUEST)
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Участник
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
                              Администратор
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
                        Выгнать
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-muted-foreground ml-auto w-4 h-4" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
