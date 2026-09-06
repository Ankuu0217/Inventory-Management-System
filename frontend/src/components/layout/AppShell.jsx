import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Package } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

/** Route path -> the name shown in the mobile top bar and in document.title. */
const PAGE_TITLES = [
  { match: (path) => path.startsWith('/dashboard'), title: 'Dashboard' },
  { match: (path) => path.startsWith('/products'), title: 'Products' },
];

/**
 * Resolves the current page name so context is never lost on narrow viewports,
 * where the sidebar (and its active state) is hidden behind a hamburger.
 *
 * @param {string} pathname
 * @returns {string}
 */
function resolvePageTitle(pathname) {
  return PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? 'Inventory';
}

/** Sidebar + content frame. The rail collapses into a drawer below 1024px. */
export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = resolvePageTitle(pathname);

  useEffect(() => {
    document.title = `${pageTitle} · Inventory Management`;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-canvas-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[240px] shrink-0 border-r border-ash bg-paper-mist lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-12 border-b border-ash px-16 py-12 lg:hidden">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-32 w-32 items-center justify-center rounded-buttons text-steel transition-colors duration-150 hover:bg-paper-mist hover:text-charcoal"
            >
              <Menu className="h-20 w-20" />
            </button>
            <span
              className="flex h-24 w-24 items-center justify-center rounded-inputs bg-electric-blue text-canvas-white"
              aria-hidden="true"
            >
              <Package className="h-12 w-12" strokeWidth={2.25} />
            </span>
            <span className="text-sm font-semibold text-charcoal">{pageTitle}</span>
          </header>

          <main className="flex-1 px-16 py-24 lg:px-32 lg:py-32">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[240px] bg-paper-mist p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
