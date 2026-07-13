import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, X, Moon, Sun, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "@/components/SearchProvider";

export function Header() {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, signOut, loading } = useAuth();
  const search = useSearch();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl animate-flicker">🎃</span>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-gradient-primary">Halloween</span>Tools
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            aria-label="Search (Ctrl+K)"
            onClick={() => search.open()}
            className="p-2 rounded-md hover:bg-muted transition-colors inline-flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-background/60 text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <button
            aria-label="Toggle theme"
            onClick={() => setLight((v) => !v)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            {light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {!loading && !user && (
            <Link
              to="/auth"
              className="hidden sm:inline-flex ml-1 items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              Sign in
            </Link>
          )}
          {!loading && user && (
            <div className="relative">
              <button
                aria-label="Account"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="ml-1 h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center hover:bg-primary/30"
              >
                <span className="text-xs font-semibold">
                  {(user.email?.[0] ?? "?").toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-11 w-56 rounded-lg border border-border bg-card shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="text-xs text-muted-foreground">Signed in as</div>
                    <div className="text-sm font-medium truncate">{user.email}</div>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                    </Link>
                  )}
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    <UserIcon className="h-4 w-4" /> Account
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-left border-t border-border"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>


      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-2 px-3 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground text-center"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
