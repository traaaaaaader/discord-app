import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileIcon, Plus, X } from "lucide-react";
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
      type === "channel"
        ? await MessagesService.create(
            query.channelId,
            query.serverId,
            values.content,
            values.fileUrl
          )
        : await ConversationMessagesService.create(
            query.conversationId,
            values.content,
            values.fileUrl
          );
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
                className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm cursor-pointer"
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
                className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm cursor-pointer"
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
                  <label className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center cursor-pointer">
                    <Plus className="text-white dark:text-[#313338]" />
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
                      className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                      placeholder={`Message ${
                        type === "conversation" ? name : "#" + name
                      }`}
                      {...field}
                    />
                    <div className="absolute top-7 right-8">
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
