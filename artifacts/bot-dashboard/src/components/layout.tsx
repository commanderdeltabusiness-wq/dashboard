import { ReactNode } from "react";
import { Link } from "wouter";
import { Terminal } from "lucide-react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

function SystemStatusIndicator() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      refetchInterval: 30000,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        <span>SYSTEM_STATUS</span>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>SYSTEM_STATUS</span>
        <span className="text-xs opacity-70">UNREACHABLE</span>
      </div>
    );
  }

  const allOnline = summary.onlineBots === summary.totalBots && summary.totalBots > 0;
  const hasErrors = summary.errorBots > 0;
  const allOffline = summary.onlineBots === 0 && summary.totalBots > 0;

  let dotClass = "bg-yellow-400";
  let label = "DEGRADED";
  let colorClass = "text-yellow-400";

  if (allOnline) {
    dotClass = "bg-green-500";
    label = "NOMINAL";
    colorClass = "text-green-500";
  } else if (hasErrors || allOffline) {
    dotClass = "bg-red-500";
    label = "INCIDENT";
    colorClass = "text-red-500";
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${colorClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass} ${allOnline ? "animate-pulse" : ""}`} />
      <span>SYSTEM_STATUS</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold tracking-tight hover:opacity-80 transition-opacity">
            <Terminal className="h-5 w-5" />
            <span>BOT_COMMAND_CENTER</span>
          </Link>

          <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
            <SystemStatusIndicator />
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
