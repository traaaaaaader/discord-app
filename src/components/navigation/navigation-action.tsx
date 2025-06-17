import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationActionComponent = () => {
  const { onOpen } = useModal();

  return (
    <div>
      <ActionTooltip side="right" align="center" label="Добавить сервер">
        <button
          onClick={() => onOpen("createServer")}
          className="group flex items-center cursor-pointer"
        >
          <div
            className="flex mx-3 h-[48px] w-[48px] rounded-[24px]
            group-hover:rounded-[16px] transition-all overflow-hidden
            items-center justify-center bg-secondary group-hover:bg-accent"
          >
            <Plus
              className="group-hover:text-accent-foreground transition text-primary"
              size={25}
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};
