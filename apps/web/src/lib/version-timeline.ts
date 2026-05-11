import type { ProtokollVersion } from "@hege/domain";

interface MembershipOption {
  membershipId: string;
  userName: string;
}

export interface VersionTimelineEntry {
  id: string;
  createdAt: string;
  authorName: string;
  summary: string;
  agendaCount: number;
  beschluesseCount: number;
  attachmentsCount: number;
  /** 0 = neueste, 1 = vorletzte, ... */
  index: number;
  /** Versions-Nummer (n, n-1, ..., 1) — fuer "v3 von 5"-Style */
  versionNumber: number;
}

/**
 * Wandelt die Versions-Liste einer Sitzung in eine angereicherte Timeline-
 * Form. Resolved den Author-Namen via Membership-Lookup, zaehlt Beschluesse
 * und Attachments, vergibt Versionsnummer.
 *
 * Reihenfolge: neueste zuerst (matcht der typischen Timeline-Optik).
 */
export function buildVersionTimeline(
  versions: ReadonlyArray<ProtokollVersion>,
  memberships: ReadonlyArray<MembershipOption>
): VersionTimelineEntry[] {
  const nameByMembershipId = new Map(
    memberships.map((entry) => [entry.membershipId, entry.userName])
  );
  const total = versions.length;

  return [...versions]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((version, index) => ({
      id: version.id,
      createdAt: version.createdAt,
      authorName: nameByMembershipId.get(version.createdByMembershipId) ?? "Unbekannt",
      summary: version.summary,
      agendaCount: version.agenda.length,
      beschluesseCount: version.beschluesse.length,
      attachmentsCount: version.attachments.length,
      index,
      versionNumber: total - index
    }));
}
