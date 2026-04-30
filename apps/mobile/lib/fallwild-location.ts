import type { FallwildRoadReference } from "@hege/domain";

import type { FallwildLocationSuggestionResponse } from "./api";
import { trimToUndefined } from "./form-utils";

export interface FallwildLocationFormFields {
  lat: string;
  lng: string;
  locationLabel: string;
  addressLabel: string;
  gemeinde: string;
  strasse: string;
  roadName: string;
  roadKilometer: string;
  roadKilometerSource: "manual" | "gip" | "unavailable";
}

export function applyFallwildLocationSuggestion<Form extends FallwildLocationFormFields>(
  current: Form,
  suggestion: FallwildLocationSuggestionResponse
): Form {
  const roadName = suggestion.roadReference?.roadName ?? suggestion.strasse;
  const roadKilometer = suggestion.roadReference?.roadKilometer;

  return {
    ...current,
    lat: formatCoordinate(suggestion.location.lat),
    lng: formatCoordinate(suggestion.location.lng),
    locationLabel: suggestion.location.label ?? current.locationLabel,
    addressLabel: suggestion.location.addressLabel ?? current.addressLabel,
    gemeinde: suggestion.gemeinde ?? current.gemeinde,
    strasse: suggestion.strasse ?? current.strasse,
    roadName: roadName ?? current.roadName,
    roadKilometer: roadKilometer ?? current.roadKilometer,
    roadKilometerSource: suggestion.roadReference?.source ?? current.roadKilometerSource
  };
}

export function buildFallwildRoadReference(form: Pick<FallwildLocationFormFields, "roadName" | "roadKilometer" | "roadKilometerSource">): FallwildRoadReference | undefined {
  const roadName = trimToUndefined(form.roadName);
  const roadKilometer = trimToUndefined(form.roadKilometer);

  if (!roadName && !roadKilometer) {
    return undefined;
  }

  return {
    roadName,
    roadKilometer,
    source: roadKilometer ? form.roadKilometerSource : "unavailable"
  };
}

export function summarizeFallwildLocationSuggestion(suggestion: FallwildLocationSuggestionResponse) {
  const details = [
    suggestion.location.addressLabel ? "Adresse" : undefined,
    suggestion.gemeinde ? "Gemeinde" : undefined,
    suggestion.strasse ? "Straße" : undefined,
    suggestion.roadReference?.roadKilometer ? "Straßenkilometer" : undefined
  ].filter(Boolean);
  const base =
    details.length > 0
      ? `GPS übernommen. Automatisch ergänzt: ${details.join(", ")}.`
      : "GPS übernommen. Adresse und Straßenkilometer bitte manuell ergänzen.";
  const warnings = [...new Set(suggestion.warnings.map((warning) => warning.trim()).filter(Boolean))];

  if (warnings.length === 0) {
    return details.length > 0
      ? "Standort, Adresse und Straßenbezug wurden automatisch übernommen."
      : base;
  }

  return `${base} Hinweis: ${warnings.join(" ")}`;
}

export function formatCoordinate(value: number) {
  return value.toFixed(6);
}
