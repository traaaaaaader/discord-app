import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteService } from "../services";
import { useNavigate, useParams } from "react-router-dom";

const InvitePage = () => {
  const params = useParams();
  const navigate = useNavigate();

	const user = JSON.parse(localStorage.user);
	if (!user) {
    navigate("/auth/login");
  }

  const { inviteCode } = params;


  const accept = async () => {
    try {
      if (!inviteCode) {
        throw new Error("Invite code is requared.");
      }
      const server = await InviteService.invite(inviteCode);
			console.log(server)
      const generalChannelId = server.channels.find(
        (channel) => channel.name === "general"
      )?.id;
			console.log(generalChannelId)
      navigate(`/servers/${server.id}/channels/${generalChannelId}`);
    } catch (e) {
			navigate("/");
      console.log("Error on invite page, ", e);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card>
        <CardContent className="rounded-lg bg-white text-black p-0 overflow-hidden min-w-md">
          <CardHeader className="pt-8 px-6">
            <CardTitle className="text-2xl text-center font-bold">
              Приглашение на сервер
            </CardTitle>
          </CardHeader>
          <CardDescription className="pb-6 text-center text-zinc-500">
            <p>Вас пригласили на сервер. </p>
            <p>Хотите вступить?</p>
          </CardDescription>
          <CardFooter className="bg-gray-100 px-6 py-4 flex flex-col">
            <div className="flex justify-end mb-2 mx-auto w-full">
              <Button className="ml-4" variant="primary" onClick={accept}>
                Принять
              </Button>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
