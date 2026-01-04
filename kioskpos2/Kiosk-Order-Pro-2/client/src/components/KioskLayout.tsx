import { Link, useLocation } from "wouter";
import { LayoutGrid, ShoppingBag, Settings, FileText, ChevronLeft, Store } from "lucide-react";
import { useSettings } from "@/hooks/use-kiosk";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function KioskLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isHome = location === "/";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display">
              {settings?.shopName || "Kiosk POS"}
            </h1>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {format(currentTime, "EEEE, MMM d")}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {format(currentTime, "h:mm a")}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Printer/WhatsApp Hidden Helper - For receipt printing */}
      <div id="receipt-print-area" className="hidden print:block">
        {/* Content injected dynamically by pages */}
      </div>
    </div>
  );
}
