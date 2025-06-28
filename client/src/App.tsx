import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HubProvider } from "@/components/hub-selector";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import MonitoringPortal from "@/pages/monitoring-portal";
import VideoWall from "@/pages/video-wall";
import Events from "@/pages/events";
import LicensePlates from "@/pages/license-plates";
import Analytics from "@/pages/analytics";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Theme provider context
export const ThemeContext = React.createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: "dark",
  setTheme: () => {},
});

function Router() {
  return (
    <HubProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/monitoring-portal" component={MonitoringPortal} />
            <Route path="/video-wall" component={VideoWall} />
            <Route path="/events" component={Events} />
            <Route path="/license-plates" component={LicensePlates} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/integrations" component={Integrations} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </HubProvider>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "dark") {
      root.classList.add("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
