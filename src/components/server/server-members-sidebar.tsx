import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ServerSection } from "./server-section";
import { ServerMember } from "./server-member";

import { Member, ServerWithMembersWithUsersAndChannels, User } from "@/utils/types/servers";

interface ServerChannelsSidebarProps {
  server: ServerWithMembersWithUsersAndChannels;
  user: User;
}

export const ServerMembersSidebar = ({
  server,
  user,
}: ServerChannelsSidebarProps) => {
  const navigate = useNavigate();

  if (!user || !server) {
    navigate("/auth/login");
  }

	const role = server.members?.find(member => member.userId === user.id)?.role;

  return (
    <div className="flex flex-col h-full text-foreground w-full bg-card">
      <ScrollArea className="flex-1 px-3 py-2">
        {!!server.members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {server.members.map((member: Member & {user: User}) => (
                <ServerMember key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
