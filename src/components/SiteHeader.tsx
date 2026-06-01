import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 bg-brand rounded-lg flex items-center justify-center">
            <div className="size-2.5 bg-brand-foreground rounded-full group-hover:animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            VALORA<span className="text-accent">.IA</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/" hash="valorador" className="hover:text-foreground transition-colors">
            Valorador
          </Link>
          <Link to="/" hash="como-funciona" className="hover:text-foreground transition-colors">
            Cómo funciona
          </Link>
          <Link to="/" hash="inmobiliarias" className="hover:text-foreground transition-colors">
            Inmobiliarias
          </Link>
        </nav>
        <Link
          to="/"
          hash="valorador"
          className="bg-brand text-brand-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
        >
          Valorar gratis
        </Link>
      </div>
    </header>
  );
}
