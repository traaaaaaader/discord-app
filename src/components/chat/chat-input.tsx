import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileIcon, Paperclip, X } from "lucide-react";
import { EmojiPicker } from "@/components/emoji-picker";
import {
  ConversationMessagesService,
  FilesService,
  MessagesService,
} from "@/services";
import { useState } from "react";
import { imageExtensions } from "@/utils/image-extension";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1),
  fileUrl: z.string(),
});

export const ChatInput = ({ query, name, type }: ChatInputProps) => {
  const [fileUrl, setFileUrl] = useState("");
  const [extension, setExtesion] = useState(fileUrl.split(".").pop() ?? "");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      fileUrl: "",
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await FilesService.uploadFile(file);
      setFileUrl(url);
      setExtesion(url.split(".").pop() ?? "");
      form.setValue("fileUrl", url);
    } catch (error) {
      console.log("Error", error);
      alert("Ошибка загрузки файла");
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async () => {
    try {
      const fileName = fileUrl.split("/").pop() ?? "";
      await FilesService.deleteFile(fileName);
      setFileUrl("");
      setExtesion("");
      form.setValue("fileUrl", "");
    } catch (error) {
      console.log("Error", error);
      alert("Ошибка удаления файла");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      if (type === "channel") {
        await MessagesService.create(
          query.channelId,
          query.serverId,
          values.content,
          values.fileUrl,
          accessToken
        );
      } else {
        await ConversationMessagesService.create(
          query.conversationId,
          values.content,
          values.fileUrl,
          accessToken
        );
      }

      setFileUrl("");
      setExtesion("");
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fileUrl && imageExtensions.includes(extension) && (
          <div className="flex flex-col p-4 pb-2 ">
            <div className="relative h-30 w-30">
              <img src={fileUrl} alt="Upload" className="rounded-md absolute" />
              <button
                onClick={handleFileDelete}
                className="bg-destructive text-white p-1 rounded-full absolute top-0 right-0 shadow-sm cursor-pointer"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <span>{fileUrl.split("/").pop() ?? ""}</span>
          </div>
        )}
        {fileUrl && !imageExtensions.includes(extension) && (
          <div className="flex p-4 pb-2 ">
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-backgrounded/10">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all"
              >
                <FileIcon className="h-15 w-15 fill-indigo-200 stroke-indigo-400" />
                <span>{fileUrl.split("/").pop() ?? ""}</span>
              </a>
              <button
                onClick={handleFileDelete}
                className="bg-destructive text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm cursor-pointer"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="relative p-4 pb-6">
          <FormField
            control={form.control}
            name="fileUrl"
            render={() => (
              <FormItem>
                <FormControl>
                  <label className="absolute top-7 left-7 h-10 w-10 bg-accent/80 hover:bg-accent/70 transition rounded-lg p-1 flex items-center justify-center cursor-pointer">
                    <Paperclip className="text-accent-foreground" />
                    <Input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <>
                    <Input
                      disabled={isLoading}
                      className="text-md px-16 py-8 bg-input border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
                      placeholder={`Написать ${
                        type === "conversation" ? name : "#" + name
                      }`}
                      {...field}
                    />
                    <div className="absolute top-8 right-8">
                      <EmojiPicker
                        onChange={(emoji: string) =>
                          field.onChange(`${field.value}${emoji}`)
                        }
                      />
                    </div>
                  </>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
