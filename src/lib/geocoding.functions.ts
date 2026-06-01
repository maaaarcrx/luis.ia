import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface AddressSuggestion {
  label: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  lat: number;
  lon: number;
}

export const buscarDirecciones = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ q: z.string().min(3).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<{ results: AddressSuggestion[] }> => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", data.q);
    url.searchParams.set("countrycodes", "es");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "7");
    url.searchParams.set("accept-language", "es");

    try {
      const res = await fetch(url.toString(), {
        headers: {
          "User-Agent": "ValoraIA/1.0 (valoracion-inmuebles-espana)",
          Accept: "application/json",
        },
      });
      if (!res.ok) return { results: [] };
      const json = (await res.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
        address?: Record<string, string>;
      }>;

      const results: AddressSuggestion[] = json
        .map((r) => {
          const a = r.address ?? {};
          const calle = a.road || a.pedestrian || a.footway || "";
          const numero = a.house_number ? `, ${a.house_number}` : "";
          const ciudad =
            a.city ||
            a.town ||
            a.village ||
            a.municipality ||
            a.county ||
            "";
          const cp = a.postcode || "";
          const dir = calle ? `${calle}${numero}` : r.display_name.split(",")[0];
          const label = [dir, ciudad && `${cp ? cp + " " : ""}${ciudad}`]
            .filter(Boolean)
            .join(", ");
          return {
            label: label || r.display_name,
            direccion: dir,
            ciudad,
            codigoPostal: cp,
            lat: Number(r.lat),
            lon: Number(r.lon),
          };
        })
        .filter((r) => r.direccion);

      return { results };
    } catch (e) {
      console.error("nominatim error", e);
      return { results: [] };
    }
  });
