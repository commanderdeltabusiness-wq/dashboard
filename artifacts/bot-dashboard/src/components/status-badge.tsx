import { cn } from "@/lib/utils";
import { BotStatus } from "@workspace/api-client-react";

interface StatusBadgeProps {
  status: BotStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: BotStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "offline":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "starting":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        getStatusColor(status),
        className
      )}
    >
      <span className={cn(
        "mr-1.5 h-2 w-2 rounded-full",
        status === "online" ? "bg-green-500" :
        status === "offline" ? "bg-slate-500" :
        status === "error" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
      )} />
      {status.toUpperCase()}
    </span>
  );
}
