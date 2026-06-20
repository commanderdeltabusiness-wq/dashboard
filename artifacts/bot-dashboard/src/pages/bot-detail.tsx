import {
  useGetBot,
  useUpdateBot,
  useDeleteBot,
  usePingBot,
  useListBotEvents,
  useGetBotApiKey,
  getGetBotQueryKey,
  getListBotEventsQueryKey,
  getListBotsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetBotApiKeyQueryKey,
} from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatNumber, formatDate } from "@/lib/utils";
import { Layout } from "@/components/layout";
import { Terminal, Activity, Settings, Trash2, ArrowLeft, Zap, Save, Key, Copy, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function ApiKeyPanel({ botId, botName }: { botId: number; botName: string }) {
  const [copied, setCopied] = useState(false);
  const { data: keyInfo, isLoading } = useGetBotApiKey(botId, {
    query: {
      enabled: !!botId,
      queryKey: getGetBotApiKeyQueryKey(botId),
    },
  });

  const handleCopy = () => {
    if (!keyInfo?.apiKey) return;
    navigator.clipboard.writeText(keyInfo.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border p-4 bg-background/50 flex items-center">
        <Key className="w-4 h-4 mr-2 text-primary" />
        <h2 className="font-bold tracking-tight text-foreground">API KEY</h2>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Send this key in the <span className="text-primary font-mono">X-API-Key</span> header when your bot pings this dashboard.
        </p>
        {isLoading ? (
          <div className="h-9 bg-background rounded animate-pulse" />
        ) : keyInfo ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono text-primary truncate">
              {keyInfo.apiKey}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="border-border hover:border-primary/50 shrink-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No key found.</p>
        )}
        <div className="text-xs text-muted-foreground border-t border-border pt-3 space-y-1 font-mono">
          <div className="text-muted-foreground/70">PING ENDPOINT</div>
          <code className="text-foreground/80 break-all">POST /api/bots/{botId}/ping</code>
        </div>
        <div className="bg-background/50 border border-border/50 rounded p-3 font-mono text-xs text-muted-foreground space-y-1">
          <div className="text-muted-foreground/60">EXAMPLE PAYLOAD</div>
          <pre className="text-foreground/70 whitespace-pre-wrap">{JSON.stringify({
            status: "online",
            messagesProcessed: 1000,
            commandsHandled: 50,
            errorsToday: 0
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default function BotDetail() {
  const [, params] = useRoute("/bots/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bot, isLoading, isError } = useGetBot(id, {
    query: {
      enabled: !!id,
      queryKey: getGetBotQueryKey(id),
      refetchInterval: 30000,
    },
  });

  const { data: events } = useListBotEvents(id, {
    query: {
      enabled: !!id,
      queryKey: getListBotEventsQueryKey(id),
      refetchInterval: 30000,
    },
  });

  const updateBot = useUpdateBot();
  const deleteBot = useDeleteBot();
  const pingBot = usePingBot();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"online" | "offline" | "error" | "starting">("offline");

  useEffect(() => {
    if (bot) {
      setEditName(bot.name);
      setEditStatus(bot.status as any);
    }
  }, [bot]);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-32 bg-card border border-border rounded-lg animate-pulse mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="h-64 bg-card border border-border rounded-lg animate-pulse" />
          </div>
          <div className="h-96 bg-card border border-border rounded-lg animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (isError || !bot) {
    return (
      <Layout>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center mt-12">
          <h2 className="text-xl font-bold text-destructive mb-2">Instance Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested bot telemetry could not be located.</p>
          <Button variant="outline" onClick={() => setLocation("/")} className="border-destructive/20 hover:bg-destructive/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN TO DASHBOARD
          </Button>
        </div>
      </Layout>
    );
  }

  const handleUpdate = () => {
    updateBot.mutate({ id, data: { name: editName, status: editStatus } }, {
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
        toast({ title: "Configuration Updated", description: "Instance settings successfully modified." });
      },
    });
  };

  const handleDelete = () => {
    deleteBot.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Instance Terminated", description: "Bot successfully removed from registry." });
        setLocation("/");
      },
    });
  };

  const handlePing = () => {
    pingBot.mutate({ id, data: { status: bot.status as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListBotEventsQueryKey(id) });
        toast({ title: "Signal Sent", description: "Heartbeat acknowledged by instance." });
      },
    });
  };

  return (
    <Layout>
      <button
        onClick={() => setLocation("/")}
        className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        CD ..
      </button>

      <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-background border border-border p-3 rounded-lg">
              <Terminal className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold font-mono text-foreground">{bot.name}</h1>
                <StatusBadge status={bot.status} />
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                ID: {bot.id.toString().padStart(4, "0")} | CREATED: {formatDate(bot.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-background border-border hover:border-primary/50 text-foreground"
              onClick={handlePing}
              disabled={pingBot.isPending}
            >
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              SEND PING
            </Button>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-background border-border hover:border-primary/50 text-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  CONFIGURE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Configure Instance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">IDENTIFIER</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-background border-border font-mono text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">FORCE STATUS</label>
                    <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">ONLINE</SelectItem>
                        <SelectItem value="offline">OFFLINE</SelectItem>
                        <SelectItem value="error">ERROR</SelectItem>
                        <SelectItem value="starting">STARTING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>CANCEL</Button>
                  <Button onClick={handleUpdate} disabled={updateBot.isPending} className="bg-primary text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    SAVE CHANGES
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Terminate Instance</DialogTitle>
                  <DialogDescription>
                    This action cannot be reversed. This will permanently delete the bot and all associated telemetry.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline">CANCEL</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteBot.isPending}>
                    CONFIRM TERMINATION
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border p-4 bg-background/50 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              <h2 className="font-bold tracking-tight text-foreground">TELEMETRY DATA</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono uppercase">Uptime</div>
                <div className="text-2xl font-mono text-foreground">{formatUptime(bot.uptimeSeconds)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono uppercase">Msgs Processed</div>
                <div className="text-2xl font-mono text-primary">{formatNumber(bot.messagesProcessed)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono uppercase">Cmds Handled</div>
                <div className="text-2xl font-mono text-foreground">{formatNumber(bot.commandsHandled)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono uppercase">Errors Today</div>
                <div className={`text-2xl font-mono ${bot.errorsToday > 0 ? "text-destructive font-bold" : "text-foreground"}`}>
                  {bot.errorsToday}
                </div>
              </div>
            </div>
          </div>

          <ApiKeyPanel botId={bot.id} botName={bot.name} />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="border-b border-border p-4 bg-background/50 flex items-center justify-between">
            <div className="flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-primary" />
              <h2 className="font-bold tracking-tight text-foreground">EVENT LOG</h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">TAIL -F</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm bg-[#0a0f16]">
            {events?.length === 0 ? (
              <div className="text-muted-foreground text-center pt-8">No recent events recorded.</div>
            ) : (
              events?.map((event) => (
                <div key={event.id} className="flex flex-col border-l-2 border-border pl-3 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground text-xs">{new Date(event.createdAt).toLocaleTimeString()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-sm bg-background border ${
                      event.type === "error" ? "text-destructive border-destructive/30" :
                      event.type === "warning" ? "text-yellow-500 border-yellow-500/30" :
                      event.type === "online" ? "text-green-500 border-green-500/30" :
                      event.type === "offline" ? "text-slate-500 border-slate-500/30" :
                      "text-primary border-primary/30"
                    }`}>
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-foreground text-opacity-90">{event.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
