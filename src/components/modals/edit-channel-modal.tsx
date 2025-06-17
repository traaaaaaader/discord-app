import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChannelType } from "@/utils/types/servers";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { ChannelsService } from "@/services";

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required.",
    })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
});

export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const navigate = useNavigate();

  const isModalOpen = isOpen && type === "editChannel";
  const { channel, server } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      if (!channel || !channel?.id || !server || !server?.id) {
        throw new Error(
          "Server ID and Channel ID are required to edit a channel."
        );
      }

      await ChannelsService.updateChannel(
        channel?.id,
        server?.id,
        values.name,
        values.type,
        accessToken
      );

      form.reset();
      navigate(0);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Изменить канал
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">
                      Название канала
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-input border-0 focus-visible:ring-0 ttext-muted-foreground focus-visible:ring-offset-0"
                        placeholder="Введите название канала"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">
                      Тип канала
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-input border-0 focus:ring-0 text-muted-foreground ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Выберите тип канала" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-secondary px-6 py-4">
              <Button variant="default" disabled={isLoading}>
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
