import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

const PriceMap = lazy(() =>
  import("@/components/PriceMap").then((m) => ({ default: m.PriceMap })),
);

export const Route = createFileRoute("/mapa-precios")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mapa de precios del suelo en España — Valora.IA" },
      {
        name: "description",
        content:
          "Mapa interactivo de precios del suelo y vivienda por zonas en España. Descubre cuánto vale tu suelo y a cuánto puedes vender.",
      },
    ],
  }),
  component: MapaPreciosPage,
});

function MapaPreciosPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {mounted ? (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Cargando mapa…
            </div>
          }
        >
          <PriceMap />
        </Suspense>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Cargando mapa…
        </div>
      )}
    </div>
  );
}
