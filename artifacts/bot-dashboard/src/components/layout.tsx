import { ReactNode } from "react";
import { Link } from "wouter";
import { Activity, Terminal } from "lucide-react";

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
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Activity className="h-4 w-4" />
              <span>SYSTEM_STATUS</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
