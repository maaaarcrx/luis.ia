import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import type { FeatureCollection, Feature } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type ZoneProps = {
  nombre: string;
  ciudad: string;
  precioSuelo: number; // €/m² suelo
  precioVenta: number; // €/m² vivienda
};

// Mock data: precios €/m² de suelo y €/m² de vivienda por zonas en España (2024-2025)
const ZONES: FeatureCollection<GeoJSON.Polygon, ZoneProps> = {
  type: "FeatureCollection",
  features: [
    // Madrid
    zone("Salamanca", "Madrid", 3650, 7200, 40.43, -3.68, 0.035),
    zone("Chamberí", "Madrid", 3200, 6400, 40.435, -3.703, 0.032),
    zone("Centro", "Madrid", 2950, 5800, 40.415, -3.703, 0.032),
    zone("Chamartín", "Madrid", 3100, 6100, 40.46, -3.68, 0.035),
    zone("Retiro", "Madrid", 3050, 5900, 40.41, -3.67, 0.03),
    zone("Tetuán", "Madrid", 2100, 3800, 40.46, -3.70, 0.035),
    zone("Vallecas", "Madrid", 1100, 2400, 40.38, -3.62, 0.045),
    zone("Carabanchel", "Madrid", 1050, 2200, 40.38, -3.74, 0.045),
    zone("Latina", "Madrid", 1250, 2600, 40.40, -3.76, 0.045),
    // Barcelona
    zone("Eixample", "Barcelona", 3450, 6800, 41.39, 2.16, 0.032),
    zone("Sarrià-Sant Gervasi", "Barcelona", 3800, 7100, 41.40, 2.13, 0.035),
    zone("Gràcia", "Barcelona", 2950, 5400, 41.42, 2.155, 0.03),
    zone("Ciutat Vella", "Barcelona", 2700, 5000, 41.38, 2.175, 0.028),
    zone("Sant Martí", "Barcelona", 2100, 4000, 41.41, 2.21, 0.04),
    zone("Nou Barris", "Barcelona", 1250, 2300, 41.45, 2.17, 0.045),
    zone("Horta-Guinardó", "Barcelona", 1850, 3400, 41.43, 2.16, 0.04),
    // Valencia
    zone("Eixample", "Valencia", 2150, 3600, 39.466, -0.375, 0.035),
    zone("Ruzafa", "Valencia", 2050, 3200, 39.46, -0.37, 0.03),
    zone("El Carmen", "Valencia", 1850, 2900, 39.48, -0.38, 0.03),
    zone("Benimaclet", "Valencia", 1400, 2100, 39.49, -0.36, 0.035),
    // Sevilla
    zone("Centro", "Sevilla", 1850, 3300, 37.39, -5.99, 0.035),
    zone("Triana", "Sevilla", 1750, 2900, 37.38, -6.00, 0.03),
    zone("Nervión", "Sevilla", 1650, 2800, 37.385, -5.95, 0.03),
    zone("Macarena", "Sevilla", 1100, 1900, 37.41, -5.99, 0.035),
    // Bilbao
    zone("Abando", "Bilbao", 2900, 4200, 43.262, -2.93, 0.028),
    zone("Indautxu", "Bilbao", 2750, 3900, 43.264, -2.945, 0.028),
    zone("Deusto", "Bilbao", 2050, 3100, 43.275, -2.96, 0.032),
    zone("Begoña", "Bilbao", 1700, 2500, 43.26, -2.91, 0.032),
    // San Sebastián
    zone("Centro", "Donostia", 3950, 6500, 43.32, -1.985, 0.028),
    zone("Gros", "Donostia", 3700, 6100, 43.325, -1.97, 0.028),
    zone("Antiguo", "Donostia", 3400, 5600, 43.31, -2.02, 0.03),
    // Málaga
    zone("Centro", "Málaga", 2150, 3800, 36.72, -4.42, 0.035),
    zone("Pedregalejo", "Málaga", 1950, 3300, 36.72, -4.36, 0.032),
    zone("Teatinos", "Málaga", 1400, 2400, 36.72, -4.49, 0.04),
    // Marbella
    zone("Marbella Centro", "Marbella", 2850, 4900, 36.51, -4.88, 0.04),
    zone("Puerto Banús", "Marbella", 3650, 6200, 36.49, -4.95, 0.035),
    // Palma
    zone("Palma Centro", "Palma", 2450, 4500, 39.57, 2.65, 0.035),
    zone("Portixol", "Palma", 2900, 5200, 39.55, 2.68, 0.03),
    // Alicante
    zone("Alicante Centro", "Alicante", 1550, 2700, 38.345, -0.49, 0.04),
    zone("Playa San Juan", "Alicante", 1850, 3100, 38.395, -0.43, 0.04),
    // Murcia
    zone("Murcia Centro", "Murcia", 1100, 1900, 37.987, -1.13, 0.04),
    // Zaragoza
    zone("Centro", "Zaragoza", 1500, 2400, 41.65, -0.88, 0.04),
    zone("Actur", "Zaragoza", 1200, 2000, 41.68, -0.89, 0.045),
    // Pamplona
    zone("Pamplona Centro", "Pamplona", 1850, 2900, 42.82, -1.65, 0.035),
    // Logroño
    zone("Logroño Centro", "Logroño", 1250, 2000, 42.47, -2.45, 0.04),
    // Valladolid
    zone("Valladolid Centro", "Valladolid", 1350, 2200, 41.65, -4.73, 0.04),
    // Burgos
    zone("Burgos Centro", "Burgos", 1200, 2000, 42.34, -3.70, 0.04),
    // Salamanca
    zone("Salamanca Centro", "Salamanca", 1450, 2400, 40.97, -5.66, 0.04),
    // León
    zone("León Centro", "León", 1150, 1900, 42.60, -5.57, 0.04),
    // Oviedo
    zone("Oviedo Centro", "Oviedo", 1300, 2200, 43.36, -5.85, 0.04),
    // Gijón
    zone("Gijón Centro", "Gijón", 1400, 2400, 43.54, -5.66, 0.04),
    // Santander
    zone("Santander Centro", "Santander", 2150, 3400, 43.46, -3.81, 0.035),
    zone("El Sardinero", "Santander", 2550, 4000, 43.47, -3.78, 0.032),
    // A Coruña
    zone("A Coruña Centro", "A Coruña", 1950, 3100, 43.37, -8.40, 0.035),
    zone("Riazor", "A Coruña", 2100, 3400, 43.37, -8.42, 0.032),
    // Vigo
    zone("Vigo Centro", "Vigo", 1650, 2700, 42.24, -8.72, 0.04),
    // Santiago
    zone("Santiago Centro", "Santiago", 1500, 2500, 42.88, -8.54, 0.04),
    // Granada
    zone("Granada Centro", "Granada", 1500, 2500, 37.18, -3.60, 0.04),
    // Córdoba
    zone("Córdoba Centro", "Córdoba", 1300, 2200, 37.88, -4.78, 0.04),
    // Cádiz
    zone("Cádiz Centro", "Cádiz", 2050, 3200, 36.53, -6.29, 0.03),
    // Jerez
    zone("Jerez Centro", "Jerez", 1100, 1800, 36.69, -6.14, 0.04),
    // Huelva
    zone("Huelva Centro", "Huelva", 1050, 1700, 37.26, -6.95, 0.04),
    // Almería
    zone("Almería Centro", "Almería", 1200, 2000, 36.84, -2.46, 0.04),
    // Toledo
    zone("Toledo Centro", "Toledo", 1300, 2100, 39.86, -4.02, 0.04),
    // Albacete
    zone("Albacete Centro", "Albacete", 1100, 1800, 38.99, -1.86, 0.04),
    // Cáceres
    zone("Cáceres Centro", "Cáceres", 1050, 1700, 39.47, -6.37, 0.04),
    // Badajoz
    zone("Badajoz Centro", "Badajoz", 950, 1600, 38.88, -6.97, 0.04),
    // Tarragona
    zone("Tarragona Centro", "Tarragona", 1750, 2900, 41.12, 1.25, 0.04),
    // Girona
    zone("Girona Centro", "Girona", 2050, 3400, 41.98, 2.82, 0.035),
    // Castellón
    zone("Castellón Centro", "Castellón", 1300, 2100, 39.99, -0.04, 0.04),
    // Las Palmas
    zone("Las Palmas Centro", "Las Palmas", 1850, 3000, 28.13, -15.45, 0.04),
    // Tenerife
    zone("Santa Cruz Centro", "Tenerife", 1800, 2900, 28.47, -16.25, 0.04),
  ],
};

// Hexagonal polygon (looks more organic than a square)
function zone(
  nombre: string,
  ciudad: string,
  precioSuelo: number,
  precioVenta: number,
  lat: number,
  lng: number,
  size: number,
): Feature<GeoJSON.Polygon, ZoneProps> {
  const latFactor = 1 / Math.cos((lat * Math.PI) / 180);
  const coords: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    coords.push([
      lng + size * latFactor * Math.cos(angle),
      lat + size * Math.sin(angle),
    ]);
  }
  coords.push(coords[0]);
  return {
    type: "Feature",
    properties: { nombre, ciudad, precioSuelo, precioVenta },
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

function colorFor(precio: number) {
  // Heatmap escala real €/m² suelo en España
  if (precio < 1200) return "#22c55e"; // green — barato
  if (precio < 1700) return "#84cc16"; // lime
  if (precio < 2200) return "#facc15"; // yellow — medio
  if (precio < 2900) return "#f97316"; // orange — caro
  return "#ef4444"; // red — prime
}


const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function PriceMap() {
  const [selected, setSelected] = useState<ZoneProps | null>(null);
  const [query, setQuery] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  // Fix default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return ZONES;
    const q = query.toLowerCase();
    return {
      ...ZONES,
      features: ZONES.features.filter(
        (f) =>
          f.properties.nombre.toLowerCase().includes(q) ||
          f.properties.ciudad.toLowerCase().includes(q),
      ),
    };
  }, [query]);

  const onSearch = async () => {
    if (!query.trim()) return;
    // First try matching mock zones
    const match = ZONES.features.find(
      (f) =>
        f.properties.nombre.toLowerCase().includes(query.toLowerCase()) ||
        f.properties.ciudad.toLowerCase().includes(query.toLowerCase()),
    );
    if (match && mapRef.current) {
      const [lng, lat] = match.geometry.coordinates[0][0];
      mapRef.current.flyTo([lat + 0.005, lng + 0.005], 14, { duration: 1.2 });
      setSelected(match.properties);
      return;
    }
    // Fallback: Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=es&limit=1&q=${encodeURIComponent(query)}`,
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data[0] && mapRef.current) {
        mapRef.current.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 13, {
          duration: 1.2,
        });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <MapContainer
        center={[40.0, -3.7]}
        zoom={6}
        minZoom={5}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <GeoJSON
          key={query}
          data={filtered}
          style={(feature) => ({
            color: "#ffffff",
            weight: 1.5,
            fillColor: colorFor((feature?.properties as ZoneProps).precioSuelo),
            fillOpacity: 0.65,
          })}
          onEachFeature={(feature, layer) => {
            const p = feature.properties as ZoneProps;
            layer.on({
              click: () => setSelected(p),
              mouseover: (e) => {
                (e.target as L.Path).setStyle({ fillOpacity: 0.85, weight: 2.5 });
              },
              mouseout: (e) => {
                (e.target as L.Path).setStyle({ fillOpacity: 0.65, weight: 1.5 });
              },
            });
          }}
        />
      </MapContainer>

      {/* Search */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
        <div className="bg-white rounded-full shadow-xl flex items-center pl-5 pr-2 py-2 gap-2">
          <svg className="size-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Buscar dirección o municipio"
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onSearch}
            className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-slate-800 transition"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-2xl shadow-lg p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-slate-500 mb-2">
          €/m² suelo
        </p>
        <div className="flex items-center gap-2">
          {[
            { c: "#22c55e", l: "< 1,2k" },
            { c: "#84cc16", l: "1,2-1,7k" },
            { c: "#facc15", l: "1,7-2,2k" },
            { c: "#f97316", l: "2,2-2,9k" },
            { c: "#ef4444", l: "> 2,9k" },
          ].map((s) => (
            <div key={s.c} className="flex flex-col items-center gap-1">
              <span className="size-5 rounded" style={{ background: s.c }} />
              <span className="text-slate-600">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected info card */}
      {selected && (
        <div className="absolute top-20 md:top-4 right-4 z-[1000] w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selected.ciudad}
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{selected.nombre}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-900"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Precio medio del suelo
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {fmt(selected.precioSuelo)} <span className="text-sm font-medium text-slate-500">/ m²</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Precio estimado de venta
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {fmt(selected.precioVenta)} <span className="text-sm font-medium text-emerald-600">/ m²</span>
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Vivienda 90 m² estimada
              </p>
              <p className="text-lg font-bold text-slate-900">
                {fmt(selected.precioVenta * 90)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
