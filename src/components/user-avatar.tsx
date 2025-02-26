import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({ src, className, onClick }: UserAvatarProps) => {
  return (
    <Avatar
      className={cn("h7 w-7 md:h-10 md:w-10", className)}
      onClick={onClick}
    >
      <AvatarImage src={src} />
    </Avatar>
  );
};
