export type EstadoVivienda = "nuevo" | "buen_estado" | "necesita_reforma";

export interface Extras {
  terraza?: boolean;
  balcon?: boolean;
  ascensor?: boolean;
  parking?: boolean;
  piscina?: boolean;
  jardin?: boolean;
  vistas?: boolean;
  reformado?: boolean;
}

export interface ValuationInput {
  metrosCuadrados: number;
  precioM2Zona: number;
  estado: EstadoVivienda;
  extras: Extras;
  planta?: number;
}

export interface ValuationResult {
  valorBajo: number;
  valorMedio: number;
  valorAlto: number;
  precioM2Ajustado: number;
  factores: { label: string; pct: number }[];
}

export function calcularValoracion(input: ValuationInput): ValuationResult {
  const base = input.metrosCuadrados * input.precioM2Zona;
  const factores: { label: string; pct: number }[] = [];

  if (input.estado === "nuevo") factores.push({ label: "Obra nueva", pct: 8 });
  if (input.extras.reformado || input.estado === "buen_estado")
    factores.push({ label: "Reformado / buen estado", pct: 10 });
  if (input.estado === "necesita_reforma")
    factores.push({ label: "Necesita reforma", pct: -15 });

  if (input.extras.terraza) factores.push({ label: "Terraza", pct: 5 });
  if (input.extras.balcon) factores.push({ label: "Balcón", pct: 3 });
  if (input.extras.parking) factores.push({ label: "Parking", pct: 7 });
  if (input.extras.ascensor) factores.push({ label: "Ascensor", pct: 4 });
  if (input.extras.piscina) factores.push({ label: "Piscina", pct: 8 });
  if (input.extras.jardin) factores.push({ label: "Jardín", pct: 6 });
  if (input.extras.vistas) factores.push({ label: "Vistas", pct: 10 });
  if ((input.planta ?? 0) >= 4) factores.push({ label: "Planta alta", pct: 3 });

  const totalPct = factores.reduce((s, f) => s + f.pct, 0);
  const ajustado = base * (1 + totalPct / 100);

  return {
    valorBajo: Math.round(ajustado * 0.92),
    valorMedio: Math.round(ajustado),
    valorAlto: Math.round(ajustado * 1.1),
    precioM2Ajustado: Math.round(ajustado / input.metrosCuadrados),
    factores,
  };
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
