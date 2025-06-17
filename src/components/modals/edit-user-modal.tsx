import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { FileUpload } from "@/components/file-upload";

import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";
import { AuthService, UsersService } from "@/services";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "User name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Avatar is required.",
  }),
});

export const EditUserModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const navigate = useNavigate();

  const { user } = data;

  const isModalOpen = isOpen && type === "editUser";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name);
      form.setValue("imageUrl", user.imageUrl);
    }
  }, [user, form]);

  const isLoading = form.formState.isSubmitting;

  const logout = async () => {
    await AuthService.logout();
    localStorage.removeItem('accessToken');
    navigate("/auth/login");
    handleClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      await UsersService.edit(
        values.name, 
        values.imageUrl,
        accessToken
      );

      form.reset();
      handleClose();
      navigate(0);
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
            Изменить профиль
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">
                      Имя пользователя
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-input border-0 focus-visible:ring-0 text-muted-foreground focus-visible:ring-offset-0"
                        placeholder="Введите имя пользователя"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-secondary px-6 py-4">
              <Button type="button" variant="google" onClick={logout}>
                Выйти
              </Button>
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
