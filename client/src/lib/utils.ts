import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  // More than a day
  const days = Math.floor(diff / 86400000);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "online":
      return "status-online";
    case "offline":
      return "status-offline";
    case "error":
      return "status-error";
    default:
      return "bg-slate-500";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "low":
      return "severity-low";
    case "medium":
      return "severity-medium";
    case "high":
      return "severity-high";
    case "critical":
      return "severity-critical";
    default:
      return "bg-slate-500";
  }
}

export function getArmedStatusColor(isArmed: boolean): string {
  return isArmed ? "bg-red-500" : "bg-green-500";
}
