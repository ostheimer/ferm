import type { AnsitzSession, FallwildVorgang, GeoPoint, Reviereinrichtung } from "@hege/domain";

import { TerritoryMap } from "./territory-map";

interface TerritoryPanelProps {
  ansitze: AnsitzSession[];
  einrichtungen: Reviereinrichtung[];
  fallwild: FallwildVorgang[];
  revierName: string;
  revierCenter: GeoPoint;
}

export function TerritoryPanel({
  ansitze,
  einrichtungen,
  fallwild,
  revierName,
  revierCenter
}: TerritoryPanelProps) {
  return (
    <section className="map-panel">
      <header className="section-header">
        <div>
          <p className="eyebrow">Kartenlage</p>
          <h2>Revier im Tagesbetrieb</h2>
        </div>
        <span className="badge">{revierName}</span>
      </header>

      <TerritoryMap
        ansitze={ansitze}
        einrichtungen={einrichtungen}
        fallwild={fallwild}
        revierCenter={revierCenter}
        revierName={revierName}
      />
    </section>
  );
}
