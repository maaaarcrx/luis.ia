export function SiteFooter() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold italic opacity-40 uppercase tracking-tighter text-brand">
          VALORA.IA · ESPAÑA
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Términos</a>
          <a href="#" className="hover:text-foreground">Privacidad</a>
          <a href="#" className="hover:text-foreground">Inmobiliarias</a>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Valora.IA · Tasador online de viviendas en España
        </div>
      </div>
    </footer>
  );
}
