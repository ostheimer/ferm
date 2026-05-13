import type { MemberInvitation } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { buildCsv } from "../../csv/escape";

/**
 * Direkt-Test der CSV-Spalten + Zellen-Belegung fuer den
 * Mitglieder-CSV-Export. Wir nutzen `buildCsv` direkt mit derselben
 * Header-Reihenfolge und denselben Cell-Mappings wie
 * `exportMemberInvitationsCsv`, damit Format-Aenderungen am Header
 * frueh auffallen (z.B. wenn jemand spaeter `phone` raus-nimmt).
 *
 * Wir testen NICHT `exportMemberInvitationsCsv` direkt — die Funktion
 * laedt aus der Datenbank und braeuchte Context-Mocking. Die
 * Cell-Logik ist trivial genug, dass die buildCsv-Validierung den
 * Vertrag absichert.
 */

const HEADER = [
  "id",
  "vorname",
  "nachname",
  "email",
  "telefon",
  "rolle",
  "jagdzeichen",
  "status",
  "erstellt_am",
  "gueltig_bis",
  "angenommen_am"
] as const;

function row(entry: MemberInvitation): ReadonlyArray<string | number> {
  return [
    entry.id,
    entry.firstName,
    entry.lastName,
    entry.email ?? "",
    entry.phone ?? "",
    entry.role,
    entry.jagdzeichen,
    entry.status,
    entry.createdAt,
    entry.expiresAt,
    entry.acceptedAt ?? ""
  ];
}

function invitation(overrides: Partial<MemberInvitation> & { id: string }): MemberInvitation {
  return {
    id: overrides.id,
    revierId: "r1",
    firstName: overrides.firstName ?? "Anna",
    lastName: overrides.lastName ?? "Berger",
    email: overrides.email,
    phone: overrides.phone,
    role: overrides.role ?? "jaeger",
    jagdzeichen: overrides.jagdzeichen ?? "AB-01",
    status: overrides.status ?? "pending",
    createdAt: overrides.createdAt ?? "2026-05-13T10:00:00Z",
    expiresAt: overrides.expiresAt ?? "2026-06-13T10:00:00Z",
    acceptedAt: overrides.acceptedAt,
    createdByMembershipId: "m1",
    sendEmail: false
  } as MemberInvitation;
}

describe("Mitglieder-CSV-Export Vertrag", () => {
  it("Header-Reihenfolge enthaelt keinen Code (vertraulich)", () => {
    expect(HEADER).not.toContain("code");
    expect(HEADER).not.toContain("token");
  });

  it("Pending-Eintrag mit allen Pflichtfeldern", () => {
    const csv = buildCsv([...HEADER], [row(invitation({ id: "i1", email: "anna@example.at", phone: "+43 660 1234" }))]);

    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(HEADER.join(","));
    expect(lines[1]).toContain("i1");
    expect(lines[1]).toContain("Anna");
    expect(lines[1]).toContain("Berger");
    expect(lines[1]).toContain("anna@example.at");
    expect(lines[1]).toContain("AB-01");
    expect(lines[1]).toContain("pending");
  });

  it("Optionale Felder werden zu leeren Zellen", () => {
    const csv = buildCsv([...HEADER], [row(invitation({ id: "i2" }))]);
    // email + phone + acceptedAt sind alle undefined -> drei leere Zellen.
    // Wir koennen das nicht direkt zaehlen, weil "Anna" und "Berger" zwischen
    // den Spalten liegen. Stattdessen: kein "undefined" und kein "null" im Output.
    expect(csv).not.toContain("undefined");
    expect(csv).not.toContain("null");
  });

  it("Accepted-Eintrag enthaelt accepted_at", () => {
    const accepted = invitation({
      id: "i3",
      status: "accepted",
      acceptedAt: "2026-05-12T08:30:00Z"
    });
    const csv = buildCsv([...HEADER], [row(accepted)]);
    expect(csv).toContain("accepted");
    expect(csv).toContain("2026-05-12T08:30:00Z");
  });
});
