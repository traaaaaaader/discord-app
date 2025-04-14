// import { Menu } from "lucide-react";

// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";
// import { ServerChannelsSidebar } from "@/components/server/server-channels-sidebar";
// import { useNavigate } from "react-router-dom";

// export const MobileToggle = ({ serverId }: { serverId: string }) => {
//   const navigate = useNavigate();
//   if (!localStorage.user || localStorage.user === "undefined") {
//     navigate("/auth/login");
//   }
//   const user = JSON.parse(localStorage.user);
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="ghost" size="icon" className="md:hidden">
//           <Menu />
//         </Button>
//       </SheetTrigger>
//       <SheetContent side="left" className="p-0 flex gap-0">
//         <div className="w-[72px]">
//           <NavigationSideBar />
//         </div>
//         <ServerChannelsSidebar userId={user.id} serverId={serverId} />
//       </SheetContent>
//     </Sheet>
//   );
// };
