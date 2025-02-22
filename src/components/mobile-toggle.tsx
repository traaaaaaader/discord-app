import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";
import { ServerChannelsSidebar } from "@/components/server/server-channels-sidebar";
import { ServerMembersSidebar } from "./server/server-members-sidebar";

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSideBar />
        </div>
        <ServerChannelsSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
};
