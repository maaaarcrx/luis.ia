import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { valorarVivienda } from "@/lib/valoracion.functions";
import { buscarDirecciones, type AddressSuggestion } from "@/lib/geocoding.functions";
import type { EstadoVivienda, Extras } from "@/lib/valuation";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, MapPin, Home, Sparkles, Loader2, Search, Check } from "lucide-react";

const EXTRAS_LIST: { key: keyof Extras; label: string; emoji: string }[] = [
  { key: "terraza", label: "Terraza", emoji: "🌿" },
  { key: "balcon", label: "Balcón", emoji: "🪟" },
  { key: "ascensor", label: "Ascensor", emoji: "🛗" },
  { key: "parking", label: "Parking", emoji: "🚗" },
  { key: "piscina", label: "Piscina", emoji: "🏊" },
  { key: "jardin", label: "Jardín", emoji: "🌳" },
  { key: "vistas", label: "Vistas", emoji: "🌅" },
  { key: "reformado", label: "Reformado", emoji: "✨" },
];

const ESTADOS: { key: EstadoVivienda; label: string; desc: string }[] = [
  { key: "nuevo", label: "Obra nueva", desc: "Vivienda recién construida o sin estrenar" },
  { key: "buen_estado", label: "Buen estado", desc: "Lista para entrar a vivir" },
  { key: "necesita_reforma", label: "A reformar", desc: "Requiere obra para habitarla" },
];

export function ValuationWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const valorar = useServerFn(valorarVivienda);
  const buscarDirs = useServerFn(buscarDirecciones);

  const [form, setForm] = useState({
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    metrosCuadrados: 90,
    habitaciones: 3,
    banos: 2,
    planta: 2,
    anoConstruccion: 1990,
    estado: "buen_estado" as EstadoVivienda,
    extras: {} as Extras,
  });

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) return;
    const q = form.direccion.trim();
    if (q.length < 4) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { results } = await buscarDirs({ data: { q } });
        setSuggestions(results);
        setShowSugg(true);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.direccion, selected, buscarDirs]);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleExtra = (k: keyof Extras) =>
    setForm((f) => ({ ...f, extras: { ...f.extras, [k]: !f.extras[k] } }));

  const pickSuggestion = (s: AddressSuggestion) => {
    setSelected(true);
    setShowSugg(false);
    setForm((f) => ({
      ...f,
      direccion: s.label,
      ciudad: s.ciudad || f.ciudad,
      codigoPostal: s.codigoPostal || f.codigoPostal,
    }));
  };

  const canNext = () => {
    if (step === 1) return form.direccion.trim().length > 3;
    if (step === 2) return form.metrosCuadrados >= 15;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const result = await valorar({
        data: {
          direccion: form.direccion,
          ciudad: form.ciudad || null,
          codigoPostal: form.codigoPostal || null,
          metrosCuadrados: form.metrosCuadrados,
          habitaciones: form.habitaciones,
          banos: form.banos,
          planta: form.planta,
          anoConstruccion: form.anoConstruccion,
          estado: form.estado,
          extras: form.extras,
        },
      });
      if (!result.id) {
        toast.error("No pudimos guardar la valoración.");
        return;
      }
      navigate({ to: "/resultado/$id", params: { id: result.id } });
    } catch (e) {
      console.error(e);
      toast.error("Ocurrió un error al calcular la valoración.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: "Ubicación", icon: MapPin },
    { n: 2, label: "Datos", icon: Home },
    { n: 3, label: "Estado", icon: Sparkles },
  ];

  return (
    <motion.div
      id="valorador"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-3xl shadow-[var(--shadow-elegant)] border border-border p-6 md:p-10 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-32 -right-32 size-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="flex justify-between mb-10 relative">
        {steps.map((s, i) => {
          const active = step >= s.n;
          const done = step > s.n;
          const Icon = s.icon;
          return (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: step === s.n ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`size-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                        <Check className="size-4" />
                      </motion.span>
                    ) : (
                      <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Icon className="size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${active ? "text-accent" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border self-center mx-3 -mt-5 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-accent origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step > s.n ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">Dirección de la vivienda</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  {searching ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                </div>
                <input
                  type="text"
                  autoFocus
                  value={form.direccion}
                  onChange={(e) => { setSelected(false); update("direccion", e.target.value); }}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                  placeholder="Calle de Velázquez 24, Madrid…"
                  className="w-full pl-12 pr-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-base md:text-lg transition-all"
                />
              </div>

              <AnimatePresence>
                {showSugg && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute z-20 left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-[var(--shadow-elegant)] overflow-hidden max-h-80 overflow-y-auto"
                  >
                    {suggestions.map((s, i) => (
                      <motion.li
                        key={`${s.label}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSuggestion(s)}
                          className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                        >
                          <MapPin className="size-4 text-accent shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{s.label}</div>
                            {s.codigoPostal && (
                              <div className="text-xs text-muted-foreground">CP {s.codigoPostal}</div>
                            )}
                          </div>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Ciudad</label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={(e) => update("ciudad", e.target.value)}
                  placeholder="Madrid, Barcelona…"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Código postal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={form.codigoPostal}
                  onChange={(e) => update("codigoPostal", e.target.value.replace(/\D/g, ""))}
                  placeholder="28013"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-3 text-accent" />
              Buscamos en todas las calles de España (OpenStreetMap) y los precios se actualizan con IA.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumberField label="m²" value={form.metrosCuadrados} min={15} max={2000} onChange={(v) => update("metrosCuadrados", v)} />
              <NumberField label="Habitaciones" value={form.habitaciones} min={0} max={15} onChange={(v) => update("habitaciones", v)} />
              <NumberField label="Baños" value={form.banos} min={0} max={10} onChange={(v) => update("banos", v)} />
              <NumberField label="Planta" value={form.planta} min={0} max={60} onChange={(v) => update("planta", v)} />
            </div>
            <div className="max-w-xs">
              <NumberField label="Año de construcción" value={form.anoConstruccion} min={1800} max={new Date().getFullYear() + 2} onChange={(v) => update("anoConstruccion", v)} />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Extras y características</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EXTRAS_LIST.map((x, i) => {
                  const on = form.extras[x.key];
                  return (
                    <motion.button
                      type="button"
                      key={x.key}
                      onClick={() => toggleExtra(x.key)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
                        on ? "bg-accent text-accent-foreground border-accent" : "bg-secondary border-border hover:border-foreground/20"
                      }`}
                    >
                      <span>{x.emoji}</span>
                      <span>{x.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-4">
            <h3 className="text-sm font-semibold">¿Cuál es el estado de la vivienda?</h3>
            {ESTADOS.map((e, i) => {
              const on = form.estado === e.key;
              return (
                <motion.button
                  type="button"
                  key={e.key}
                  onClick={() => update("estado", e.key)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left p-5 rounded-2xl border transition-colors ${
                    on ? "bg-accent/5 border-accent ring-2 ring-accent/20" : "bg-secondary border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{e.label}</div>
                      <div className="text-sm text-muted-foreground">{e.desc}</div>
                    </div>
                    <motion.div
                      animate={{ scale: on ? 1 : 0.8 }}
                      className={`size-5 rounded-full border-2 grid place-items-center ${on ? "border-accent bg-accent" : "border-border"}`}
                    >
                      {on && <Check className="size-3 text-accent-foreground" />}
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 mt-10 relative">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || loading}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center gap-2"
        >
          <ArrowLeft className="size-4" /> Atrás
        </button>

        {step < 3 ? (
          <motion.button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-accent text-accent-foreground px-7 py-3.5 rounded-xl text-base font-bold hover:shadow-lg hover:shadow-accent/30 transition-shadow flex items-center gap-2 disabled:opacity-50"
          >
            Continuar <ArrowRight className="size-4" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={submit}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-brand text-brand-foreground px-7 py-3.5 rounded-xl text-base font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 overflow-hidden"
          >
            {loading && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
            )}
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Analizando con IA…" : "Valorar con IA"}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
    </motion.div>
  );
}

const LOADING_MESSAGES = [
  "Localizando la vivienda en el mapa…",
  "Analizando el mercado inmobiliario de la zona…",
  "Buscando propiedades comparables cercanas…",
  "Calculando precio €/m² actualizado…",
  "Aplicando ajustes por estado y extras…",
  "Generando análisis con inteligencia artificial…",
];

function LoadingOverlay() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-card/95 backdrop-blur-sm grid place-items-center z-30 rounded-3xl"
    >
      <div className="text-center max-w-sm px-6">
        <div className="relative size-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-accent/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <Sparkles className="absolute inset-0 m-auto size-7 text-accent" />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="font-semibold text-foreground"
          >
            {LOADING_MESSAGES[idx]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-5 flex justify-center gap-1">
          {LOADING_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i <= idx ? "bg-accent w-6" : "bg-border w-3"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function NumberField({
  label, value, onChange, min, max,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-semibold transition-all"
      />
    </div>
  );
}
