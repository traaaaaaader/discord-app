import { useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChannelType } from "@/utils/types/servers";

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

import { useNavigate } from "react-router-dom";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const CreateChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const navigate = useNavigate();

  const isModalOpen = isOpen && type === "createChannel";
  const { server, channelType } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType);
    } else {
      form.setValue("type", ChannelType.TEXT);
    }
  }, [channelType, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      if (!server) {
        throw new Error("Server ID is required to create a channel.");
      }

      await ChannelsService.createChannel(
        server.id, 
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
            Добавить канал
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
                        className="bg-input border-0 focus-visible:ring-0 text-muted-foreground focus-visible:ring-offset-0"
                        placeholder="Название канала"
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
                    <FormLabel className="text-card-foreground">Тип канала</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-input border-0 focus:ring-0 text-muted-foreground  ring-offset-0 focus:ring-offset-0 capitalize outline-none">
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
                Создать
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
