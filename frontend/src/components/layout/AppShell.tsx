import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[240px] shrink-0 border-r border-ash bg-paper-mist md:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-12 border-b border-ash px-16 py-12 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-20 w-20" />
            </Button>
            <span className="text-sm font-semibold text-charcoal">Inventory</span>
          </header>

          <main className="flex-1 px-16 py-24 md:px-32 md:py-32">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[240px] max-w-[80vw] bg-paper-mist p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
