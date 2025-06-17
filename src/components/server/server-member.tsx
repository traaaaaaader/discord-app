import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Member, MemberRole, User } from "@/utils/types/servers";
import { useNavigate } from "react-router-dom";

import { UserAvatar } from "@/components/user-avatar";

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

interface ServerMemberProps {
  member: Member & { user: User };
}

export const ServerMember = ({ member }: ServerMemberProps) => {
  const navigate = useNavigate();

  const icon = roleIconMap[member.role];

  const onClick = () => {
    navigate(`/`); //TODO
  };

  return (
    <button
      onClick={onClick}
      className={
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground transition mb-1 cursor-pointer"
      }
    >
      <UserAvatar
        src={member.user.imageUrl}
        className="md:h-9 md:w-9"
      />
      <p className={"font-semibold text-md"}>{member.user.name}</p>
      {icon}
    </button>
  );
};
