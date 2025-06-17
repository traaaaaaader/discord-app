import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { ServersService } from "@/services";

export const DeleteServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const navigate = useNavigate();

  const isModalOpen = isOpen && type === "deleteServer";
  const { server } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      if (!server || !server?.id) {
        throw new Error("Server ID is required to delete a server.");
      }

      setIsLoading(true);

      await ServersService.delete(server?.id, accessToken);

      onClose();
      navigate("/");
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
            Удалить сервер
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Вы уверены, что хотите сделать это? <br />
            <span className="font-semibold text-primary">
              {server?.name}
            </span>{" "}
            будет удален без возможности восстановления.
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
