import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { obtenerValoracion } from "@/lib/valoracion.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatEUR } from "@/lib/valuation";
import { generarInformePDF } from "@/lib/pdf-report";
import { Sparkles, TrendingUp, MapPin, ArrowLeft, Download, Phone, ShieldCheck } from "lucide-react";

function AnimatedEUR({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => formatEUR(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export const Route = createFileRoute("/resultado/$id")({
  loader: async ({ params }) => {
    try {
      const v = await obtenerValoracion({ data: { id: params.id } });
      return { v };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.v
          ? `Valoración: ${formatEUR(Number(loaderData.v.valor_estimado_medio))} — ${loaderData.v.direccion} | Valora.IA`
          : "Resultado de valoración | Valora.IA",
      },
      {
        name: "description",
        content: "Resultado de tu valoración inmobiliaria con IA en España.",
      },
    ],
  }),
  component: ResultadoPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Valoración no encontrada</h1>
        <p className="text-muted-foreground mb-6">El enlace puede haber expirado.</p>
        <Link to="/" className="text-accent font-semibold">Volver al inicio</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">No se pudo cargar el resultado</h1>
        <Link to="/" className="text-accent font-semibold">Volver al inicio</Link>
      </div>
    </div>
  ),
});

function ResultadoPage() {
  const { v } = Route.useLoaderData();
  const medio = Number(v.valor_estimado_medio);
  const bajo = Number(v.valor_estimado_bajo);
  const alto = Number(v.valor_estimado_alto);
  const precioM2 = Math.round(medio / v.metros_cuadrados);
  const precioM2Zona = Number(v.precio_m2_zona ?? 0);
  const diffPct = precioM2Zona ? ((precioM2 - precioM2Zona) / precioM2Zona) * 100 : 0;
  const extras = (v.extras as Record<string, boolean>) ?? {};
  const extrasActivos = Object.entries(extras).filter(([, x]) => x).map(([k]) => k);

  // Position of mid on the range bar
  const range = alto - bajo;
  const pos = range > 0 ? ((medio - bajo) / range) * 100 : 50;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="size-4" /> Nueva valoración
          </Link>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* LEFT: main value */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[var(--shadow-card)] animate-fade-up">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="size-3" />
                      Valoración estimada
                    </span>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      <span>{v.direccion}</span>
                    </div>
                  </div>
                </div>

                <div className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  <AnimatedEUR value={medio} />
                </div>
                <div className="text-muted-foreground mt-2">
                  {precioM2.toLocaleString("es-ES")} €/m² · {v.metros_cuadrados} m²
                  {v.barrio && <> · {v.barrio}, {v.ciudad}</>}
                </div>

                {/* Range bar */}
                <div className="mt-10 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Rango bajo</span>
                    <span>Punto óptimo</span>
                    <span>Rango alto</span>
                  </div>
                  <div className="relative h-3 bg-secondary rounded-full overflow-visible">
                    <div className="absolute inset-y-0 left-[8%] right-[8%] rounded-full bg-gradient-to-r from-secondary via-accent/50 to-secondary" />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-accent ring-4 ring-card shadow-lg"
                      initial={{ left: "0%", scale: 0 }}
                      animate={{ left: `calc(${pos}% - 10px)`, scale: 1 }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{formatEUR(bajo)}</span>
                    <span className="text-accent">{formatEUR(medio)}</span>
                    <span>{formatEUR(alto)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border mt-10 -mx-2">
                  <div className="px-4">
                    <div className="text-xs text-muted-foreground">Precio zona</div>
                    <div className="font-bold mt-1">
                      {precioM2Zona ? `${Math.round(precioM2Zona).toLocaleString("es-ES")} €/m²` : "—"}
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="text-xs text-muted-foreground">Diferencia</div>
                    <div className={`font-bold mt-1 ${diffPct >= 0 ? "text-success" : "text-destructive"}`}>
                      {diffPct >= 0 ? "+" : ""}{diffPct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="text-xs text-muted-foreground">Confianza</div>
                    <div className="font-bold mt-1 text-success">Alta</div>
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-accent/5 border border-accent/15 rounded-3xl p-6 md:p-8 animate-fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-7 bg-accent rounded-full grid place-items-center">
                    <Sparkles className="size-3.5 text-accent-foreground" />
                  </div>
                  <h3 className="font-bold">Análisis con inteligencia artificial</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  {v.explicacion_ia || "Análisis no disponible."}
                </p>
              </div>
            </div>

            {/* RIGHT: meta */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 animate-fade-up">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Detalle de la vivienda
                </h4>
                <dl className="space-y-3 text-sm">
                  <Row k="Superficie" v={`${v.metros_cuadrados} m²`} />
                  {v.habitaciones != null && <Row k="Habitaciones" v={String(v.habitaciones)} />}
                  {v.banos != null && <Row k="Baños" v={String(v.banos)} />}
                  {v.planta != null && <Row k="Planta" v={String(v.planta)} />}
                  {v.ano_construccion != null && <Row k="Año" v={String(v.ano_construccion)} />}
                  {v.estado && <Row k="Estado" v={String(v.estado).replace("_", " ")} />}
                  {v.codigo_postal && <Row k="CP" v={String(v.codigo_postal)} />}
                </dl>
                {extrasActivos.length > 0 && (
                  <>
                    <div className="h-px bg-border my-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Extras
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extrasActivos.map((x) => (
                        <span
                          key={x}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary capitalize"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 animate-fade-up">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="size-4" /> Tendencia de la zona
                </h4>
                <div className="text-3xl font-bold text-success">+3.8%</div>
                <p className="text-xs text-muted-foreground mt-1">Variación interanual estimada</p>
              </div>

              <div className="bg-brand text-brand-foreground rounded-3xl p-6 animate-fade-up">
                <h4 className="font-bold mb-2">¿Quieres vender?</h4>
                <p className="text-brand-foreground/70 text-sm mb-5">
                  Conecta con inmobiliarias especializadas en tu barrio y recibe ofertas.
                </p>
                <button className="w-full bg-brand-foreground text-brand py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
                  <Phone className="size-4" /> Obtener ofertas
                </button>
                <button
                  onClick={() => generarInformePDF(v as never)}
                  className="w-full mt-2 border border-brand-foreground/20 text-brand-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-foreground/5"
                >
                  <Download className="size-4" /> Descargar informe PDF
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold capitalize">{v}</dd>
    </div>
  );
}
