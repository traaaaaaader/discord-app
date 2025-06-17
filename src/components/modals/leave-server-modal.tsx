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
import { ServersService } from "@/services";
import { useModal } from "@/hooks/use-modal-store";

export const LeaveServerModal = () => {
  const {isOpen, onClose, type, data } = useModal();
  const navigate = useNavigate();
  
  const isModalOpen = isOpen && type === "leaveServer";
  const {server} = data;
  
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken || !server?.id) {
        navigate("/auth/login");
        return;
      }

      await ServersService.leave(server.id, accessToken);

      onClose();
      navigate(0);
      navigate("/auth/login");
    } catch(error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Покинуть сервер
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Вы точно хотите покинуть <span className="font-semibold text-primary">{server?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-secondary px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
            >
              Отменить
            </Button>
            <Button
              disabled={isLoading}
              onClick={onClick}
              variant="default"
            >
              Подтвердить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
