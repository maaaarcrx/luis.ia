import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PriceExplorerWidget() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto bg-slate-50 dark:bg-card rounded-[2.5rem] p-8 md:p-14 border border-border">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl"
          >
            {/* Simulated heatmap */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 20% 30%, #22c55e 0%, transparent 35%), radial-gradient(circle at 70% 25%, #facc15 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ef4444 0%, transparent 38%), radial-gradient(circle at 30% 80%, #f97316 0%, transparent 35%), linear-gradient(135deg, #dcfce7, #fef9c3, #fee2e2)",
              }}
            />
            {/* Grid overlay to suggest map tiles */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute bottom-5 left-5 right-5 md:right-auto md:w-64 bg-white rounded-2xl shadow-lg p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Precios medios
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Home className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">2.203 € / m²</p>
                    <p className="text-[10px] text-slate-500">Vivienda</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">3.103 € / m²</p>
                    <p className="text-[10px] text-slate-500">Obra nueva</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Evolución
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="size-3" /> +4,2%
                  </span>
                </div>
                <svg viewBox="0 0 200 40" className="w-full h-8">
                  <defs>
                    <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,30 L25,28 L50,25 L75,22 L100,18 L125,20 L150,14 L175,10 L200,6 L200,40 L0,40 Z"
                    fill="url(#lg)"
                  />
                  <path
                    d="M0,30 L25,28 L50,25 L75,22 L100,18 L125,20 L150,14 L175,10 L200,6"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* Text + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Mapa interactivo
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-5">
              Explora los precios en tu zona
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Descubre el precio medio de venta y de alquiler en cada municipio.
              Revisa la evolución del precio a lo largo del tiempo. Navega en
              nuestro mapa interactivo y descubre el valor real de tu suelo.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/mapa-precios">
                Mapa de precios <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
