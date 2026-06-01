import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ValuationWizard } from "@/components/ValuationWizard";
import { ShieldCheck, Sparkles, FileText, TrendingUp, MapPin, Building2 } from "lucide-react";
import { PriceExplorerWidget } from "@/components/PriceExplorerWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Valora.IA — Tasador online de viviendas en España con IA" },
      {
        name: "description",
        content:
          "Calcula cuánto vale tu casa al instante. Tasación inmobiliaria gratuita con IA basada en datos reales del mercado español: Madrid, Barcelona, Valencia y más.",
      },
      { property: "og:title", content: "Valora.IA — Cuánto vale tu casa, al instante" },
      {
        property: "og:description",
        content: "Tasador online de pisos en España. Valoración gratuita con IA en segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs font-semibold text-muted-foreground mb-6 animate-fade-up">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Datos en directo de +50.000 viviendas en España
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-fade-up">
            Cuánto vale tu casa,{" "}
            <span className="text-accent italic">al instante.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty animate-fade-up">
            Tasación inmobiliaria gratuita con inteligencia artificial. Precio medio
            por m² de tu barrio, rango de valor y análisis profesional en segundos.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <ValuationWizard />
        </div>

        <div className="max-w-4xl mx-auto mt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Madrid</span>
          <span>·</span>
          <span>Barcelona</span>
          <span>·</span>
          <span>Valencia</span>
          <span>·</span>
          <span>Sevilla</span>
          <span>·</span>
          <span>Bilbao</span>
          <span>·</span>
          <span>Málaga</span>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="bg-card border-y border-border py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Cómo funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Una tasación seria, en 60 segundos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "1. Introduces la dirección",
                desc: "Localizamos tu vivienda en nuestra base de datos por código postal y barrio.",
              },
              {
                icon: Building2,
                title: "2. Describes la vivienda",
                desc: "m², habitaciones, planta, año y los extras que la diferencian.",
              },
              {
                icon: Sparkles,
                title: "3. La IA analiza el mercado",
                desc: "Calculamos el valor con datos reales de zona y nuestro modelo lo explica.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-border bg-background hover:shadow-[var(--shadow-card)] transition-shadow"
              >
                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="size-5 text-accent" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE EXPLORER */}
      <PriceExplorerWidget />

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Datos reales del mercado español",
              desc: "Trabajamos con precios medios por m² para Madrid, Barcelona, Valencia, Bilbao, Sevilla, Málaga y más.",
            },
            {
              icon: TrendingUp,
              title: "Rango bajo / medio / alto",
              desc: "No solo un número: te damos el margen de negociación realista para tu vivienda.",
            },
            {
              icon: FileText,
              title: "Explicación con IA",
              desc: "Un análisis escrito que justifica el valor y los factores que más influyen.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="size-10 rounded-xl bg-brand text-brand-foreground flex items-center justify-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "+50.000", l: "Viviendas valoradas" },
            { n: "8.000", l: "Códigos postales" },
            { n: "< 60s", l: "Tiempo medio" },
            { n: "94%", l: "Precisión vs tasador" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-accent">
                {s.n}
              </div>
              <div className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-2">
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Confianza
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Lo que dicen nuestros usuarios
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                q: "Vendí mi piso en 3 semanas al precio que Valora.IA marcó. Acertaron de pleno.",
                a: "Marta G.",
                c: "Chamberí, Madrid",
              },
              {
                q: "Antes de poner el piso en venta lo comparé con dos APIs y una tasación oficial. Valora.IA fue la más cercana.",
                a: "Jordi R.",
                c: "Eixample, Barcelona",
              },
              {
                q: "Súper rápido y la explicación con IA te ayuda a entender por qué tu casa vale lo que vale.",
                a: "Lucía M.",
                c: "Triana, Sevilla",
              },
            ].map((t, i) => (
              <motion.div
                key={t.a}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="text-accent text-2xl leading-none mb-3">"</div>
                <p className="text-foreground/80 leading-relaxed text-sm mb-5">
                  {t.q}
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-accent/15 grid place-items-center text-accent font-bold text-sm">
                    {t.a[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.a}</div>
                    <div className="text-xs text-muted-foreground">{t.c}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Preguntas frecuentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Todo lo que necesitas saber
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "¿La valoración es gratis?",
                a: "Sí, totalmente. Puedes valorar todas las viviendas que quieras sin coste y sin registro.",
              },
              {
                q: "¿Qué datos usáis para calcular el precio?",
                a: "Combinamos precios medios por m² de cada barrio y código postal con un modelo que ajusta por superficie, estado, planta, año de construcción y extras.",
              },
              {
                q: "¿Sustituye a una tasación oficial?",
                a: "No. Es una estimación de mercado muy precisa para orientar la decisión de venta o compra, pero no sustituye a una tasación homologada para hipotecas.",
              },
              {
                q: "¿Cubrís toda España?",
                a: "Sí. Trabajamos con datos de todas las provincias y, cuando no tenemos una zona exacta, nuestra IA estima en base a municipio y entorno.",
              },
              {
                q: "¿Puedo descargar el informe?",
                a: "Sí. Al terminar la valoración recibes un informe PDF profesional con todos los detalles, listo para compartir.",
              },
            ].map((f, i) => (
              <motion.details
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-background p-5 open:bg-secondary/40"
              >
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-accent text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* INMOBILIARIAS */}
      <section
        id="inmobiliarias"
        className="py-20 px-6 bg-brand text-brand-foreground"
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Para inmobiliarias
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3 mb-4">
            Tasaciones automáticas para tu agencia
          </h2>
          <p className="text-brand-foreground/70 max-w-2xl mx-auto mb-8">
            Marca blanca, integración con tu CRM y captación de leads cualificados de
            propietarios listos para vender.
          </p>
          <a
            href="mailto:hola@valora.ia"
            className="inline-flex items-center gap-2 bg-brand-foreground text-brand px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all"
          >
            Hablar con ventas
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
