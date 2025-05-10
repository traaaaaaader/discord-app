import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthService, UsersService } from "@/services";
import { NavLink, useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react"
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be 6 or more characters long.",
  }),
});

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        
        const user = await UsersService.get(accessToken);
        if (user) {
          navigate("/");
        }
      } catch (error) {
        console.log("Error ", error);
      }
    };

    fetchUser();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmitEmail = async (values: z.infer<typeof formSchema>) => {
    try {
      const { accessToken } = await AuthService.login(values.email, values.password);
      
      localStorage.setItem("accessToken", accessToken);

      form.reset();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <CardContent className="rounded-lg bg-white text-black p-0 overflow-hidden min-w-md">
        <CardHeader className="pt-8 px-6">
          <CardTitle className="text-2xl text-center font-bold">
            С возвращением!
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitEmail)}
            className="space-y-8"
          >
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text black focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Пароль
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text black focus-visible:ring-offset-0"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <CardFooter className="bg-gray-100 px-6 py-4 flex flex-col">
              <div className="flex justify-between items-center mb-2 mx-auto w-full">
                <CardDescription className="text-center text-zinc-500">
                  Нужна учетная запись?
                  <NavLink
                    to={"/auth/register"}
                    className="ml-1 text-indigo-500 dark:text-indigo-400"
                  >
                    Зарегистрироваться
                  </NavLink>
                </CardDescription>
                <Button className="ml-4" variant="primary" disabled={isLoading}>
                  Войти
                </Button>
              </div>
              <Button
                type="button"
                variant="google"
                onClick={() => {
                  window.location.href =
                    import.meta.env.VITE_GOOGLE_AUTH_URL ?? "";
                }}
              >
                <Chrome className="mr-2" />
                Войти
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
