import type { AnsitzSession, FallwildVorgang, Reviereinrichtung } from "@hege/domain";

interface TerritoryPanelProps {
  ansitze: AnsitzSession[];
  einrichtungen: Reviereinrichtung[];
  fallwild: FallwildVorgang[];
}

export function TerritoryPanel({ ansitze, einrichtungen, fallwild }: TerritoryPanelProps) {
  const markers = [
    ...einrichtungen.map((entry) => ({
      id: entry.id,
      top: `${40 + (entry.location.lat % 1) * 100}%`,
      left: `${15 + (entry.location.lng % 1) * 100}%`,
      type: "Einrichtung",
      title: entry.name
    })),
    ...ansitze.map((entry) => ({
      id: entry.id,
      top: `${35 + (entry.location.lat % 1) * 100}%`,
      left: `${10 + (entry.location.lng % 1) * 100}%`,
      type: "Ansitz",
      title: entry.standortName
    })),
    ...fallwild.map((entry) => ({
      id: entry.id,
      top: `${45 + (entry.location.lat % 1) * 100}%`,
      left: `${5 + (entry.location.lng % 1) * 100}%`,
      type: "Fallwild",
      title: entry.gemeinde
    }))
  ];

  return (
    <section className="map-panel">
      <header className="section-header">
        <div>
          <p className="eyebrow">Kartenlage</p>
          <h2>Revier im Tagesbetrieb</h2>
        </div>
        <span className="badge">Google Maps geplant</span>
      </header>

      <div className="map-stage" aria-label="Revierkarte">
        {markers.map((marker) => (
          <button
            key={marker.id}
            className="map-marker"
            style={{ top: marker.top, left: marker.left }}
            type="button"
          >
            <span>{marker.type}</span>
            <strong>{marker.title}</strong>
          </button>
        ))}
        <div className="map-grid" />
      </div>
    </section>
  );
}
