import type { PublicPlanKey } from "@hege/domain";

export interface PublicPricingPlan {
  key: PublicPlanKey;
  name: string;
  audience: string;
  priceLabel: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  isSelfServe: boolean;
}

const CONTACT_CTA_HREF = "mailto:info@hege.app?subject=hege%20Organisation";

export const PUBLIC_PRICING_PLANS: PublicPricingPlan[] = [
  {
    key: "starter",
    name: "Starter",
    audience: "Kleines Revier, schneller Einstieg",
    priceLabel: "Preis folgt",
    description: "Für Reviere, die Ansitze, Fallwild und Protokolle sofort digital zusammenziehen wollen.",
    highlights: ["1 Revier", "Backoffice und App", "Self-Serve Registrierung"],
    ctaLabel: "Starter anlegen",
    ctaHref: "/registrieren?plan=starter",
    isSelfServe: true
  },
  {
    key: "revier",
    name: "Revier",
    audience: "Aktive Jagdgesellschaft mit mehreren Rollen",
    priceLabel: "Preis folgt",
    description: "Für laufenden Revierbetrieb mit Revier-Admin, Schriftführung und Jäger-App auf einer Datenbasis.",
    highlights: ["Mehrere Rollen", "Protokolle und Freigaben", "Offline-Queue für Feldmeldungen"],
    ctaLabel: "Revier starten",
    ctaHref: "/registrieren?plan=revier",
    isSelfServe: true
  },
  {
    key: "organisation",
    name: "Organisation",
    audience: "Größere Struktur, individuelle Abstimmung",
    priceLabel: "Individuell",
    description: "Für Verbund, mehrere Reviere oder erweitertes Rollenkonzept mit abgestimmtem Einführungspfad.",
    highlights: ["Mehrere Reviere", "Abgestimmtes Onboarding", "Persönliche Einführung"],
    ctaLabel: "Kontakt aufnehmen",
    ctaHref: CONTACT_CTA_HREF,
    isSelfServe: false
  }
];

export function isPublicPlanKey(value: string): value is PublicPlanKey {
  return PUBLIC_PRICING_PLANS.some((plan) => plan.key === value);
}

export function isSelfServePlanKey(value: string): value is Exclude<PublicPlanKey, "organisation"> {
  return PUBLIC_PRICING_PLANS.some((plan) => plan.key === value && plan.isSelfServe);
}

export function getDefaultSelfServePlanKey(): Exclude<PublicPlanKey, "organisation"> {
  return "starter";
}
