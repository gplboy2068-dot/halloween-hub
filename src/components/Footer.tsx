import { Link } from "@tanstack/react-router";
import { CATEGORIES, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎃</span>
            <span className="font-display font-bold">
              <span className="text-gradient-primary">Halloween</span>Tools
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{SITE.tagline}.</p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tools" className="hover:text-primary">All Tools</Link></li>
            <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
            <li><Link to="/collections" className="hover:text-primary">Collections</Link></li>
            <li><Link to="/ideas" className="hover:text-primary">Ideas</Link></li>
            <li><Link to="/for" className="hover:text-primary">For You</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to="/categories/$slug" params={{ slug: c.slug }} className="hover:text-primary">
                  {c.emoji} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link to="/disclaimer" className="hover:text-primary">Disclaimer</Link></li>
            <li><Link to="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.domain}. Made with 🎃 for the spooky season.</p>
          <p>Not affiliated with any commercial Halloween brand.</p>
        </div>
      </div>
    </footer>
  );
}
