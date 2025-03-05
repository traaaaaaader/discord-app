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
    navigate(0);
    handleClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const user = await UsersService.edit(values.name, values.imageUrl);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

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
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit your profile
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
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      User name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text black focus-visible:ring-offset-0"
                        placeholder="Enter new user name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button type="button" variant="google" onClick={logout}>
                Logout
              </Button>
              <Button variant="primary" disabled={isLoading}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
