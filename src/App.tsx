import "@/styles/globals.css";
import { BrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ModalProvider } from "./components/providers/modal-provider";
import { ThemeProvider } from "./components/providers/theme-provider";
import { SocketProvider } from "./components/providers/socket-provider";
import { QueryProvider } from "./components/providers/query-provide";
import { MediaProvider } from "./components/providers/media-provider";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SocketProvider>
          <MediaProvider>
            <ModalProvider />
            <QueryProvider>
              <Layout />
            </QueryProvider>
          </MediaProvider>
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
