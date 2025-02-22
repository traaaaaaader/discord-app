import "@/styles/globals.css";
import { BrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ModalProvider } from "./components/providers/modal-provider";
import { ThemeProvider } from "./components/providers/theme-provider";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {/* <SocketProvider> */}
          <ModalProvider />
          {/* <QueryProvider> */}
          <Layout />
          {/* </QueryProvider> */}
          {/* </SocketProvider> */}
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
