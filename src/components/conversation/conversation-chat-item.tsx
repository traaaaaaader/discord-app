import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { User } from "@/utils/types/chat";
import { Edit, FileIcon, Trash } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { MessagesService } from "../../services";

interface ConversationChatItemProps {
  id: string;
  content: string;
  user: User;
  timestap: string;
  fileUrl: string | null | undefined;
  deleted: boolean;
  isUpdated: boolean;
  socketQuery: Record<string, string>;
}

const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];

const formSchema = z.object({
  content: z.string().min(1),
});

export const ConversationChatItem = ({
  id,
  content,
  user,
  timestap,
  fileUrl,
  deleted,
  isUpdated,
  socketQuery,
}: ConversationChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const currentUser = JSON.parse(localStorage.user);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    try {
      await MessagesService.update(
        id,
        socketQuery.channelId,
        socketQuery.serverId,
        values.content,
        accessToken
      );
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content]);

  const extension = fileUrl && fileUrl.split(".").pop();

  const isOwner = user.id === currentUser.id;
  const canDeleteMesage = !deleted && isOwner;
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isImage = extension && imageExtensions.includes(extension);
  const isFile = fileUrl && !isImage;

  return (
    <div className="relative group flex items-center hover:bg-secondary-foreground/5  p-4 transition w-full rounded-2xl overflow-hidden">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={user.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-md hover:underline cursor-pointer">
                {user.name}
              </p>
            </div>
            <span className="text-sx text-muted-foreground">
              {timestap}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener norefer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <img
                src={fileUrl}
                alt={content}
                className="absolute object-cover"
              />
            </a>
          )}
          {isFile && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-backgrounded/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all"
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-foreground",
                deleted &&
                  "italic text-muted-foreground  text-sm mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-muted-foreground ">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="relative w-full">
                        <Input
                          disabled={isLoading}
                          className="p-2 bg-input border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
                          placeholder="Edited message"
                          {...field}
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="default">
                  Сохранить
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-muted-foreground">
                Нажмите esc чтобы выйти, enter чтобы сохранить
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMesage && (
        <div className="hidden group-hover:flex items-center p-2 gap-x-2 bg-secondary text-secondary-foreground border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-5 h-5 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  query: { messageId: id, ...socketQuery },
                })
              }
              className="cursor-pointer ml-auto w-5 h-5 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
