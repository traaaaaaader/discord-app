import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useOrigin } from "@/hooks/use-origin";
import { InviteService } from "@/services";

export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";
  const { server } = data;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  const onNew = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        return;
      }

      if (!server) {
        throw new Error("Server is required to invite.");
      }

      setIsLoading(true);
      const response = await InviteService.update(server.id, accessToken);

      onOpen("invite", { server: response });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Пригласить друзей
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="text-card-foreground">
            Ссылка-приглашение на сервер
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-input border-0 focus-visible:ring-0 text-muted-foreground focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button disabled={isLoading} onClick={onCopy} size="icon">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={onNew}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground mt-4"
          >
            Создать новую ссылку
            <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
