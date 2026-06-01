import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { calcularValoracion, type Extras, type EstadoVivienda } from "./valuation";

const Schema = z.object({
  direccion: z.string().min(3).max(255),
  ciudad: z.string().min(2).max(120).optional().nullable(),
  codigoPostal: z.string().min(4).max(10).optional().nullable(),
  metrosCuadrados: z.number().int().min(15).max(2000),
  habitaciones: z.number().int().min(0).max(20).optional().nullable(),
  banos: z.number().int().min(0).max(15).optional().nullable(),
  planta: z.number().int().min(0).max(60).optional().nullable(),
  anoConstruccion: z.number().int().min(1800).max(2100).optional().nullable(),
  estado: z.enum(["nuevo", "buen_estado", "necesita_reforma"]),
  extras: z.object({
    terraza: z.boolean().optional(),
    balcon: z.boolean().optional(),
    ascensor: z.boolean().optional(),
    parking: z.boolean().optional(),
    piscina: z.boolean().optional(),
    jardin: z.boolean().optional(),
    vistas: z.boolean().optional(),
    reformado: z.boolean().optional(),
  }),
});

async function estimarPrecioM2ConIA(
  codigoPostal?: string | null,
  ciudad?: string | null,
): Promise<{ precio: number; barrio: string; ciudad: string } | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  const ubic = [codigoPostal, ciudad].filter(Boolean).join(", ");
  if (!ubic) return null;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto del mercado inmobiliario español 2025. Conoces precios medios €/m² de venta de vivienda por código postal, barrio y municipio (Idealista, Fotocasa, INE).",
          },
          {
            role: "user",
            content: `Dame el precio medio actual de venta (€/m²) de vivienda para esta ubicación en España: "${ubic}". Si no la conoces con exactitud, estima con tu mejor criterio basándote en municipio y provincia.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "precio_zona",
              description: "Devuelve precio m² estimado",
              parameters: {
                type: "object",
                properties: {
                  precio_m2: { type: "number" },
                  barrio: { type: "string" },
                  ciudad: { type: "string" },
                },
                required: ["precio_m2", "barrio", "ciudad"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "precio_zona" } },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return null;
    const parsed = JSON.parse(args);
    const precio = Number(parsed.precio_m2);
    if (!precio || precio < 200 || precio > 20000) return null;
    return {
      precio,
      barrio: parsed.barrio || "Zona estimada",
      ciudad: parsed.ciudad || ciudad || "España",
    };
  } catch (e) {
    console.error("estimarPrecioM2ConIA", e);
    return null;
  }
}

async function buscarZona(codigoPostal?: string | null, ciudad?: string | null) {
  // Try by postal code first
  if (codigoPostal) {
    const { data } = await supabaseAdmin
      .from("zonas_espana")
      .select("*")
      .eq("codigo_postal", codigoPostal)
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }
  // Fallback by city average
  if (ciudad) {
    const { data } = await supabaseAdmin
      .from("zonas_espana")
      .select("*")
      .ilike("ciudad", ciudad)
      .limit(50);
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + Number(r.precio_m2_medio), 0) / data.length;
      return { ...data[0], precio_m2_medio: avg };
    }
  }
  // AI-powered estimation when not in DB (covers all of Spain)
  const ia = await estimarPrecioM2ConIA(codigoPostal, ciudad);
  if (ia) {
    return {
      codigo_postal: codigoPostal ?? "",
      ciudad: ia.ciudad,
      barrio: ia.barrio,
      precio_m2_medio: ia.precio,
    };
  }
  // Spain national fallback
  return { codigo_postal: codigoPostal ?? "", ciudad: ciudad ?? "España", barrio: "Media nacional", precio_m2_medio: 2200 };
}

async function generarExplicacion(payload: {
  direccion: string;
  zona: string;
  ciudad: string;
  m2: number;
  estado: EstadoVivienda;
  extras: Extras;
  valorMedio: number;
  precioM2Ajustado: number;
  precioM2Zona: number;
}): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return "Análisis no disponible en este momento.";

  const sys =
    "Eres un analista inmobiliario senior en España. Escribe en español, en 2-3 frases máximo, sin inventar precios distintos a los que te indican. Tono profesional, claro y útil.";
  const extrasList = Object.entries(payload.extras)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ") || "sin extras destacables";

  const user = `Analiza esta vivienda y explica por qué su valor estimado es razonable, comparándolo con el precio medio de la zona.
- Dirección: ${payload.direccion} (${payload.ciudad}, zona ${payload.zona})
- Superficie: ${payload.m2} m²
- Estado: ${payload.estado.replace("_", " ")}
- Extras: ${extrasList}
- Precio medio de la zona: ${payload.precioM2Zona} €/m²
- Precio ajustado del inmueble: ${payload.precioM2Ajustado} €/m²
- Valor estimado: ${payload.valorMedio} €

Menciona el % de diferencia respecto a la media de la zona y 1-2 factores clave que más influyen.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return "No se pudo generar el análisis automático en este momento.";
    }
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() ?? "Análisis no disponible.";
  } catch (e) {
    console.error(e);
    return "No se pudo generar el análisis automático en este momento.";
  }
}

export const valorarVivienda = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Schema.parse(data))
  .handler(async ({ data }) => {
    const zona = await buscarZona(data.codigoPostal, data.ciudad);
    const precioM2Zona = Number(zona.precio_m2_medio);

    const calc = calcularValoracion({
      metrosCuadrados: data.metrosCuadrados,
      precioM2Zona,
      estado: data.estado,
      extras: data.extras,
      planta: data.planta ?? undefined,
    });

    const explicacion = await generarExplicacion({
      direccion: data.direccion,
      zona: zona.barrio,
      ciudad: zona.ciudad,
      m2: data.metrosCuadrados,
      estado: data.estado,
      extras: data.extras,
      valorMedio: calc.valorMedio,
      precioM2Ajustado: calc.precioM2Ajustado,
      precioM2Zona,
    });

    const { data: row, error } = await supabaseAdmin
      .from("valoraciones")
      .insert({
        direccion: data.direccion,
        ciudad: zona.ciudad,
        barrio: zona.barrio,
        codigo_postal: data.codigoPostal ?? zona.codigo_postal,
        metros_cuadrados: data.metrosCuadrados,
        habitaciones: data.habitaciones ?? null,
        banos: data.banos ?? null,
        planta: data.planta ?? null,
        ano_construccion: data.anoConstruccion ?? null,
        estado: data.estado,
        extras: data.extras as never,
        precio_m2_zona: precioM2Zona,
        valor_estimado_bajo: calc.valorBajo,
        valor_estimado_medio: calc.valorMedio,
        valor_estimado_alto: calc.valorAlto,
        explicacion_ia: explicacion,
      })
      .select("id")
      .single();

    if (error) {
      console.error("insert valoracion error", error);
    }

    return {
      id: row?.id ?? null,
      zona: { barrio: zona.barrio, ciudad: zona.ciudad, codigoPostal: zona.codigo_postal, precioM2: precioM2Zona },
      ...calc,
      explicacion,
    };
  });

export const obtenerValoracion = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("valoraciones")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Valoración no encontrada");
    return row;
  });
