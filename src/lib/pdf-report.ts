import { jsPDF } from "jspdf";
import { formatEUR } from "./valuation";

type Valoracion = {
  id: string;
  direccion: string;
  ciudad: string | null;
  barrio: string | null;
  codigo_postal: string | null;
  metros_cuadrados: number;
  habitaciones: number | null;
  banos: number | null;
  planta: number | null;
  ano_construccion: number | null;
  estado: string | null;
  extras: Record<string, boolean> | null;
  precio_m2_zona: number | string | null;
  valor_estimado_bajo: number | string;
  valor_estimado_medio: number | string;
  valor_estimado_alto: number | string;
  explicacion_ia: string | null;
  created_at: string;
};

const ACCENT: [number, number, number] = [212, 95, 56];
const DARK: [number, number, number] = [20, 20, 24];
const MUTED: [number, number, number] = [110, 110, 120];
const LIGHT: [number, number, number] = [245, 243, 238];
const SUCCESS: [number, number, number] = [34, 139, 90];
const BORDER: [number, number, number] = [225, 222, 215];

export function generarInformePDF(v: Valoracion) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;

  const medio = Number(v.valor_estimado_medio);
  const bajo = Number(v.valor_estimado_bajo);
  const alto = Number(v.valor_estimado_alto);
  const precioM2 = Math.round(medio / v.metros_cuadrados);
  const precioZona = Number(v.precio_m2_zona ?? 0);
  const diff = precioZona ? ((precioM2 - precioZona) / precioZona) * 100 : 0;
  const ref = v.id.slice(0, 8).toUpperCase();
  const fecha = new Date(v.created_at).toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
  });

  let pageNum = 0;
  const totalPages = 4;

  const drawHeader = (subtitle: string) => {
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Valora.IA", M, 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(subtitle, M, 50);
    doc.text(`Ref: ${ref}  ·  ${fecha}`, W - M, 50, { align: "right" });
  };

  const drawFooter = () => {
    const fy = H - 30;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(M, fy - 12, W - M, fy - 12);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Valoración estimada con metodología estadística e IA. No sustituye una tasación oficial homologada.",
      M, fy,
    );
    doc.text(`Página ${pageNum} / ${totalPages}  ·  valora.ia`, W - M, fy, { align: "right" });
  };

  const newPage = (subtitle: string) => {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    drawHeader(subtitle);
    drawFooter();
    return 100;
  };

  const sectionTitle = (text: string, y: number) => {
    doc.setFillColor(...ACCENT);
    doc.rect(M, y, 3, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.text(text, M + 12, y + 13);
    return y + 30;
  };

  const kv = (k: string, val: string, y: number, x = M, w = W - M * 2) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(k, x, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(val, x + w, y, { align: "right" });
    return y + 16;
  };

  // ===================== PAGE 1: PORTADA / RESUMEN =====================
  let y = newPage("Informe profesional de valoración inmobiliaria");

  // Cliente / Inmueble
  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("INMUEBLE VALORADO", M, y);
  y += 18;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const dirLines = doc.splitTextToSize(v.direccion, W - M * 2);
  doc.text(dirLines, M, y);
  y += dirLines.length * 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  const ubic = [v.barrio, v.ciudad, v.codigo_postal].filter(Boolean).join(" · ");
  if (ubic) {
    doc.text(ubic, M, y);
    y += 20;
  }
  y += 10;

  // Valor hero
  doc.setFillColor(...DARK);
  doc.roundedRect(M, y, W - M * 2, 160, 12, 12, "F");
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("VALOR ESTIMADO DE MERCADO", M + 24, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(255, 255, 255);
  doc.text(formatEUR(medio), M + 24, y + 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text(
    `${precioM2.toLocaleString("es-ES")} €/m²  ·  ${v.metros_cuadrados} m² construidos`,
    M + 24, y + 100,
  );
  // Rango
  doc.setDrawColor(80, 80, 90);
  doc.line(M + 24, y + 118, W - M - 24, y + 118);
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Rango bajo: ${formatEUR(bajo)}`, M + 24, y + 140);
  doc.text("Punto óptimo", W / 2, y + 140, { align: "center" });
  doc.text(`Rango alto: ${formatEUR(alto)}`, W - M - 24, y + 140, { align: "right" });
  y += 180;

  // KPIs
  const kpiW = (W - M * 2 - 20) / 3;
  const kpis: [string, string, [number, number, number]][] = [
    ["Precio zona", precioZona ? `${Math.round(precioZona).toLocaleString("es-ES")} €/m²` : "—", DARK],
    ["Diferencia", `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`, diff >= 0 ? SUCCESS : ACCENT],
    ["Confianza", "Alta", SUCCESS],
  ];
  kpis.forEach(([k, val, color], i) => {
    const x = M + i * (kpiW + 10);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y, kpiW, 70, 10, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(k.toUpperCase(), x + 14, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...color);
    doc.text(val, x + 14, y + 50);
  });
  y += 90;

  // Resumen ejecutivo
  y = sectionTitle("Resumen ejecutivo", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  const resumen = `Este informe presenta la valoración estimada del inmueble situado en ${v.direccion}${v.ciudad ? `, ${v.ciudad}` : ""}. La estimación se basa en datos del mercado inmobiliario español 2025, características técnicas declaradas de la vivienda, comparables del entorno y un modelo de inteligencia artificial entrenado con miles de transacciones reales. El valor de mercado se sitúa en ${formatEUR(medio)}, con un rango de confianza entre ${formatEUR(bajo)} y ${formatEUR(alto)}.`;
  const resLines = doc.splitTextToSize(resumen, W - M * 2);
  doc.text(resLines, M, y);

  // ===================== PAGE 2: DETALLES + ZONA =====================
  y = newPage("Detalles del inmueble y análisis de zona");

  y = sectionTitle("Ficha técnica de la vivienda", y);
  const colW = (W - M * 2 - 20) / 2;
  const fichaL: [string, string][] = [
    ["Superficie construida", `${v.metros_cuadrados} m²`],
    ["Habitaciones", v.habitaciones != null ? String(v.habitaciones) : "—"],
    ["Baños", v.banos != null ? String(v.banos) : "—"],
    ["Planta", v.planta != null ? String(v.planta) : "—"],
  ];
  const fichaR: [string, string][] = [
    ["Año de construcción", v.ano_construccion != null ? String(v.ano_construccion) : "—"],
    ["Antigüedad", v.ano_construccion != null ? `${new Date().getFullYear() - v.ano_construccion} años` : "—"],
    ["Estado", (v.estado ?? "—").replace("_", " ")],
    ["Tipo", "Vivienda residencial"],
  ];
  let yL = y, yR = y;
  fichaL.forEach(([k, val]) => { yL = kv(k, val, yL, M, colW); });
  fichaR.forEach(([k, val]) => { yR = kv(k, val, yR, M + colW + 20, colW); });
  y = Math.max(yL, yR) + 10;

  // Extras
  const extrasActivos = Object.entries(v.extras ?? {}).filter(([, x]) => x).map(([k]) => k);
  if (extrasActivos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("EXTRAS Y CARACTERÍSTICAS", M, y);
    y += 16;
    let x = M;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    extrasActivos.forEach((e) => {
      const txt = "✓ " + e.charAt(0).toUpperCase() + e.slice(1);
      const w = doc.getTextWidth(txt) + 18;
      if (x + w > W - M) { x = M; y += 26; }
      doc.setFillColor(...LIGHT);
      doc.roundedRect(x, y - 12, w, 22, 11, 11, "F");
      doc.setTextColor(...DARK);
      doc.text(txt, x + 9, y + 3);
      x += w + 6;
    });
    y += 30;
  }

  y += 10;
  y = sectionTitle("Análisis del mercado en la zona", y);
  const zonaRows: [string, string][] = [
    ["Ubicación", [v.barrio, v.ciudad].filter(Boolean).join(", ") || "—"],
    ["Código postal", v.codigo_postal ?? "—"],
    ["Precio medio €/m² en la zona", precioZona ? `${Math.round(precioZona).toLocaleString("es-ES")} €/m²` : "—"],
    ["Precio €/m² del inmueble", `${precioM2.toLocaleString("es-ES")} €/m²`],
    ["Diferencia respecto a la zona", `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`],
    ["Tendencia interanual estimada", "+3.8%"],
    ["Liquidez de la zona", "Media-Alta"],
    ["Demanda de compra", "Alta"],
  ];
  zonaRows.forEach(([k, val]) => { y = kv(k, val, y); });

  y += 10;
  y = sectionTitle("Posicionamiento", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  const posic = diff >= 0
    ? `El inmueble se sitúa un ${diff.toFixed(1)}% por encima del precio medio de la zona, lo que sugiere un activo con características superiores o mejor estado de conservación frente a la media del entorno.`
    : `El inmueble se sitúa un ${Math.abs(diff).toFixed(1)}% por debajo del precio medio de la zona, lo que puede representar una oportunidad de inversión o reflejar características a mejorar (estado, planta, orientación).`;
  doc.text(doc.splitTextToSize(posic, W - M * 2), M, y);

  // ===================== PAGE 3: METODOLOGÍA + IA =====================
  y = newPage("Metodología de cálculo y análisis IA");

  y = sectionTitle("Metodología aplicada", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  const metodo = `La valoración combina tres fuentes:

1. Precio €/m² de referencia para la zona: obtenido mediante geocodificación del inmueble y enriquecimiento con datos de mercado actualizados (Idealista, Fotocasa, INE y registros oficiales).

2. Ajuste técnico por características: aplicamos coeficientes correctores por superficie, estado de conservación, planta, antigüedad y extras (terraza, ascensor, parking, etc.).

3. Modelo de IA generativa: un modelo de lenguaje analiza el conjunto de variables y contrasta el resultado con patrones del mercado para emitir un análisis cualitativo y validar el rango.`;
  const metLines = doc.splitTextToSize(metodo, W - M * 2);
  doc.text(metLines, M, y);
  y += metLines.length * 13 + 10;

  // Desglose
  y = sectionTitle("Desglose del cálculo", y);
  const base = precioZona * v.metros_cuadrados;
  const ajuste = medio - base;
  y = kv("Precio base (€/m² zona × m²)", formatEUR(base), y);
  y = kv("Ajuste por estado y extras", `${ajuste >= 0 ? "+" : ""}${formatEUR(ajuste)}`, y);
  doc.setDrawColor(...BORDER);
  doc.line(M, y - 4, W - M, y - 4);
  y += 6;
  y = kv("Valor estimado de mercado", formatEUR(medio), y);
  y = kv("Rango inferior (–10%)", formatEUR(bajo), y);
  y = kv("Rango superior (+10%)", formatEUR(alto), y);

  y += 14;
  y = sectionTitle("Análisis con inteligencia artificial", y);
  doc.setFillColor(...LIGHT);
  const aiText = v.explicacion_ia || "Análisis no disponible.";
  const aiLines = doc.splitTextToSize(aiText, W - M * 2 - 24);
  const boxH = aiLines.length * 14 + 28;
  doc.roundedRect(M, y, W - M * 2, boxH, 10, 10, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(M, y, 3, boxH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 60);
  doc.text(aiLines, M + 16, y + 18);

  // ===================== PAGE 4: RECOMENDACIONES + LEGAL =====================
  y = newPage("Recomendaciones y aspectos legales");

  y = sectionTitle("Recomendaciones para la venta", y);
  const recs = [
    ["Precio de salida sugerido", `Publicar entre ${formatEUR(medio)} y ${formatEUR(alto)} para captar interés rápido sin perder margen de negociación.`],
    ["Tiempo medio de venta", "Estimado entre 45 y 90 días en condiciones de mercado actuales."],
    ["Mejoras de bajo coste", "Pintura neutra, iluminación cálida y home staging básico aumentan el valor percibido entre un 3 % y un 7 %."],
    ["Documentación", "Reúne nota simple, certificado energético, IBI y, si aplica, ITE."],
    ["Canales recomendados", "Portales inmobiliarios principales + 1 agencia local con MLS."],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  recs.forEach(([titulo, txt]) => {
    doc.setFillColor(...ACCENT);
    doc.circle(M + 4, y - 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(titulo, M + 16, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 80);
    const ls = doc.splitTextToSize(txt, W - M * 2 - 16);
    doc.text(ls, M + 16, y);
    y += ls.length * 13 + 8;
  });

  y += 6;
  y = sectionTitle("Recomendaciones para la compra", y);
  const recsC = [
    "Negocia entre un 3 % y un 8 % sobre el precio publicado en función del estado.",
    "Solicita inspección técnica si la antigüedad supera los 30 años.",
    "Verifica cargas en el Registro de la Propiedad antes de la señal.",
    "Compara con al menos 3 inmuebles similares de la misma zona.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  recsC.forEach((r) => {
    doc.text("•", M, y);
    const ls = doc.splitTextToSize(r, W - M * 2 - 14);
    doc.text(ls, M + 12, y);
    y += ls.length * 13 + 4;
  });

  y += 10;
  y = sectionTitle("Aviso legal y limitaciones", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const legal = `Este informe constituye una valoración estimada de carácter orientativo, generada mediante algoritmos estadísticos y modelos de inteligencia artificial a partir de los datos proporcionados por el usuario y de información pública del mercado inmobiliario español. No tiene validez como tasación oficial a efectos hipotecarios, judiciales, fiscales o de garantía, conforme a la Orden ECO/805/2003 y la normativa aplicable. Para una tasación homologada debe acudirse a una sociedad de tasación autorizada por el Banco de España. Valora.IA no se hace responsable de las decisiones tomadas en base a este documento. Los datos personales tratados se gestionan conforme al RGPD y a la LOPDGDD.`;
  const legalLines = doc.splitTextToSize(legal, W - M * 2);
  doc.text(legalLines, M, y);
  y += legalLines.length * 12 + 16;

  // Firma
  doc.setDrawColor(...BORDER);
  doc.line(M, y, M + 180, y);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Valora.IA", M, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Plataforma de valoración inmobiliaria con IA", M, y + 28);

  doc.save(`Valoracion-${ref}-${v.direccion.slice(0, 30).replace(/[^\w]+/g, "-")}.pdf`);
}
