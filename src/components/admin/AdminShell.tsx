import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Wrench, FileText, FolderTree, Tags, Image as ImageIcon,
  HelpCircle, Search, Code2, Users, BarChart3, Settings, ScrollText,
  ArrowRightLeft, Link2, Menu, X, ExternalLink, MessagesSquare,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
type NavGroup = { section: string; items: NavItem[] };
const NAV: NavGroup[] = [
  { section: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { section: "Content", items: [
    { to: "/admin/tools", label: "Tools", icon: Wrench },
    { to: "/admin/articles", label: "Articles", icon: FileText },
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/tags", label: "Tags", icon: Tags },
    { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { to: "/admin/media", label: "Media Library", icon: ImageIcon },
    { to: "/admin/community", label: "Community Feed", icon: MessagesSquare },
  ]},
  { section: "SEO", items: [
    { to: "/admin/seo", label: "SEO", icon: Search },
    { to: "/admin/schema", label: "Schema", icon: Code2 },
    { to: "/admin/redirects", label: "Redirects", icon: ArrowRightLeft },
    { to: "/admin/linking", label: "Internal Linking", icon: Link2 },
  ]},
  { section: "System", items: [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/logs", label: "Logs", icon: ScrollText },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ]},
] as const;

export function AdminShell({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur-xl transition-transform`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <span className="text-2xl animate-flicker">🎃</span>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-sm">
              <span className="text-gradient-primary">Halloween</span>Tools
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-2 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact ? path === item.to : path.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="pt-4 border-t border-border">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
          </div>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 rounded-md hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-display text-lg sm:text-xl font-bold flex-1 truncate">{title}</h1>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
