import { Route, Routes, useLocation } from "react-router-dom";
import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";
import {
  RegisterPage,
  ChannelPage,
  ConversationPage,
  InvitePage,
  LoginPage,
  SetupPage,
  HomePage,
} from "@/pages/index";
import { cn } from "@/lib/utils";
import AuthLayout from "./AuthLayout";

const Layout = () => {
  const location = useLocation();
  const showSidebar = !location.pathname.includes("/auth");

  return (
    <div className="h-full">
      {showSidebar && (
        <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
          <NavigationSideBar />
        </div>
      )}
      <main
        className={cn(
          "h-full transition-all",
          showSidebar ? "md:pl-[72px]" : "pl-0"
        )}
      >
        <Routes>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
          <Route path="invite/:inviteCode" element={<InvitePage />} />
          <Route
            path="servers/:serverId/channels/:channelId"
            element={<ChannelPage />}
          />
          <Route
            path="conversations/:memberId"
            element={<ConversationPage />}
          />
          <Route path="setup" element={<SetupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;
