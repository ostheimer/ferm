"use client";

import type { AnsitzSession, FallwildVorgang, GeoPoint, Reviereinrichtung } from "@hege/domain";
import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { useMemo } from "react";

const MAP_ID_FALLBACK = "hege-revier-map";

interface TerritoryMapProps {
  revierName: string;
  revierCenter: GeoPoint;
  ansitze: AnsitzSession[];
  einrichtungen: Reviereinrichtung[];
  fallwild: FallwildVorgang[];
}

export function TerritoryMap({ revierName, revierCenter, ansitze, einrichtungen, fallwild }: TerritoryMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? MAP_ID_FALLBACK;

  const markers = useMemo(
    () =>
      [
        ...einrichtungen.map((entry) => ({
          id: `einrichtung-${entry.id}`,
          type: "Einrichtung" as const,
          title: entry.name,
          position: { lat: entry.location.lat, lng: entry.location.lng }
        })),
        ...ansitze.map((entry) => ({
          id: `ansitz-${entry.id}`,
          type: "Ansitz" as const,
          title: entry.standortName,
          position: { lat: entry.location.lat, lng: entry.location.lng }
        })),
        ...fallwild.map((entry) => ({
          id: `fallwild-${entry.id}`,
          type: "Fallwild" as const,
          title: `${entry.wildart} · ${entry.gemeinde}`,
          position: { lat: entry.location.lat, lng: entry.location.lng }
        }))
      ].filter((marker) => Number.isFinite(marker.position.lat) && Number.isFinite(marker.position.lng)),
    [ansitze, einrichtungen, fallwild]
  );

  if (!apiKey) {
    return <TerritoryMapFallback markers={markers} revierName={revierName} />;
  }

  return (
    <div className="map-stage" aria-label={`Revierkarte ${revierName}`}>
      <APIProvider apiKey={apiKey} libraries={["marker"]}>
        <Map
          defaultCenter={{ lat: revierCenter.lat, lng: revierCenter.lng }}
          defaultZoom={12}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: "100%", height: "100%" }}
        >
          {markers.map((marker) => (
            <AdvancedMarker key={marker.id} position={marker.position} title={marker.title}>
              <Pin background={pinColor(marker.type)} borderColor="#102218" glyphColor="#fff9ef" />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}

function pinColor(type: "Einrichtung" | "Ansitz" | "Fallwild"): string {
  switch (type) {
    case "Einrichtung":
      return "#9db36f";
    case "Ansitz":
      return "#24493a";
    case "Fallwild":
      return "#9d4a3f";
  }
}

interface TerritoryMapFallbackProps {
  revierName: string;
  markers: Array<{ id: string; type: "Einrichtung" | "Ansitz" | "Fallwild"; title: string; position: { lat: number; lng: number } }>;
}

function TerritoryMapFallback({ revierName, markers }: TerritoryMapFallbackProps) {
  return (
    <div className="map-stage" aria-label={`Revierkarte ${revierName}`}>
      <div className="map-grid" />
      <div className="map-fallback-note">
        <p className="eyebrow">Karte deaktiviert</p>
        <p>
          <code>NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY</code> ist nicht gesetzt. Für die echte Karte einen
          Browser-Key in Vercel hinterlegen.
        </p>
        <p>
          {markers.length > 0
            ? `${markers.length} Marker im Datensatz: ${summarizeMarkers(markers)}.`
            : "Aktuell keine Marker im Revier hinterlegt."}
        </p>
      </div>
    </div>
  );
}

export function summarizeMarkers(markers: TerritoryMapFallbackProps["markers"]): string {
  const counts = { Einrichtung: 0, Ansitz: 0, Fallwild: 0 } as Record<
    "Einrichtung" | "Ansitz" | "Fallwild",
    number
  >;

  for (const marker of markers) {
    counts[marker.type] += 1;
  }

  return [
    counts.Einrichtung > 0 ? `${counts.Einrichtung}× Einrichtung` : null,
    counts.Ansitz > 0 ? `${counts.Ansitz}× Ansitz` : null,
    counts.Fallwild > 0 ? `${counts.Fallwild}× Fallwild` : null
  ]
    .filter(Boolean)
    .join(", ");
}
