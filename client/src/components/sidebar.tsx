import { Link, useLocation } from "wouter";
import { Video, Grid3x3, List, Settings, BarChart3, Shield, Car, Monitor } from "lucide-react";
import HubSelector from "./hub-selector";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/alert360_logo.png_1751080963078.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: Grid3x3 },
  { name: "Monitoring Portal", href: "/monitoring-portal", icon: Monitor },
  { name: "Video Wall", href: "/video-wall", icon: Video },
  { name: "Events", href: "/events", icon: List },
  { name: "License Plates", href: "/license-plates", icon: Car },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Integrations", href: "/integrations", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <img 
            src={logoUrl} 
            alt="Alert360 Video Shield" 
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-semibold text-white">Alert 360 Video Shield</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Hub Selector */}
      <HubSelector />
    </div>
  );
}
