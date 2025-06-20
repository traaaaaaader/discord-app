import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/use-modal-store";
import { MessagesService } from "@/services";

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "deleteMessage";
  const { query } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        return;
      }

      setIsLoading(true);

      if (!query || !query.messageId || !query.channelId || !query.serverId) {
        throw new Error(
          "Message ID, Channel ID and Server ID are required to delete a message."
        );
      }

      await MessagesService.delete(
        query.messageId,
        query.channelId,
        query.serverId,
        accessToken
      );

      onClose();
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
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Вы уверены, что хотите удалить сообщение? <br />
            Сообщение будет удалено без возможности восстановления.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-secondary px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Отменить
            </Button>
            <Button disabled={isLoading} onClick={onClick} variant="default">
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
