import { useListBots, useGetDashboardSummary, getListBotsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatNumber } from "@/lib/utils";
import { Layout } from "@/components/layout";
import { Terminal, Activity, CheckCircle2, AlertCircle } from "lucide-react";

function SummaryCards() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      refetchInterval: 30000
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-card border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center text-muted-foreground mb-2">
          <Terminal className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium tracking-tight">TOTAL BOTS</span>
        </div>
        <div className="text-3xl font-bold text-foreground">{summary.totalBots}</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center text-green-500/80 mb-2">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium tracking-tight">ONLINE</span>
        </div>
        <div className="text-3xl font-bold text-green-500">{summary.onlineBots}</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center text-red-500/80 mb-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium tracking-tight">ERRORS</span>
        </div>
        <div className="text-3xl font-bold text-red-500">{summary.errorBots}</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center text-primary/80 mb-2">
          <Activity className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium tracking-tight">MESSAGES</span>
        </div>
        <div className="text-3xl font-bold text-primary">{formatNumber(summary.totalMessages)}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: bots, isLoading, isError } = useListBots({
    query: {
      queryKey: getListBotsQueryKey(),
      refetchInterval: 30000
    }
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">System Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time metrics and operational status</p>
        </div>
      </div>

      <SummaryCards />

      <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center text-foreground">
        <Terminal className="w-5 h-5 mr-2 text-primary" />
        ACTIVE INSTANCES
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Failed to retrieve bot telemetry.</p>
        </div>
      ) : bots?.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center">
          <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No active instances</h3>
          <p className="text-muted-foreground">No bots registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots?.map(bot => (
            <Link key={bot.id} href={`/bots/${bot.id}`} className="group block">
              <div className="bg-card border border-border rounded-lg p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(32,178,170,0.15)] h-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent translate-y-[-100%] group-hover:animate-[scan_2s_linear_infinite]" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-mono group-hover:text-primary transition-colors">
                      {bot.name}
                    </h3>
                    <div className="text-xs text-muted-foreground font-mono mt-1">ID: {bot.id.toString().padStart(4, '0')}</div>
                  </div>
                  <StatusBadge status={bot.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 flex-1">
                  <div className="bg-background/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1 uppercase">Uptime</div>
                    <div className="font-mono text-foreground">{formatUptime(bot.uptimeSeconds)}</div>
                  </div>
                  <div className="bg-background/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1 uppercase">Errors Today</div>
                    <div className={`font-mono ${bot.errorsToday > 0 ? 'text-destructive font-bold' : 'text-foreground'}`}>
                      {bot.errorsToday}
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1 uppercase">Msgs Proc</div>
                    <div className="font-mono text-foreground">{formatNumber(bot.messagesProcessed)}</div>
                  </div>
                  <div className="bg-background/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1 uppercase">Cmds Hndld</div>
                    <div className="font-mono text-foreground">{formatNumber(bot.commandsHandled)}</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <span>LAST SEEN</span>
                  <span className="font-mono">{bot.lastSeenAt ? new Date(bot.lastSeenAt).toLocaleTimeString() : 'NEVER'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
