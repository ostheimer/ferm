import type { Role, Sitzung } from "@hege/domain";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { assertRole } from "../../auth/service";
import { getDb } from "../../db/client";
import {
  dokumente,
  protokollBeschluesse,
  protokollVersionen,
  sitzungen,
  sitzungTeilnehmer
} from "../../db/schema";
import { getServerEnv } from "../../env";
import { RouteError } from "../../http/errors";
import { getSitzungById } from "./queries";
import type {
  CreateSitzungInput,
  CreateSitzungVersionInput,
  UpdateSitzungInput
} from "./schemas";

interface BaseSitzungCommand {
  revierId: string;
  membershipId: string;
  role: Role;
}

interface CreateSitzungCommand extends BaseSitzungCommand {
  input: CreateSitzungInput;
}

interface UpdateSitzungCommand extends BaseSitzungCommand {
  sitzungId: string;
  input: UpdateSitzungInput;
}

interface CreateVersionCommand extends BaseSitzungCommand {
  sitzungId: string;
  input: CreateSitzungVersionInput;
}

interface FreigabeCommand extends BaseSitzungCommand {
  sitzungId: string;
}

export async function createSitzung(command: CreateSitzungCommand): Promise<Sitzung> {
  assertMutationPrerequisites(command.role, ["schriftfuehrer", "revier-admin"]);

  const sitzungId = `sitzung-${randomUUID()}`;

  await getDb().transaction(async (tx) => {
    await tx.insert(sitzungen).values({
      id: sitzungId,
      revierId: command.revierId,
      title: command.input.title,
      scheduledAt: command.input.scheduledAt,
      locationLabel: command.input.locationLabel,
      status: "entwurf"
    });

    for (const participant of command.input.participants) {
      await tx.insert(sitzungTeilnehmer).values({
        id: `${sitzungId}-${participant.membershipId}`,
        sitzungId,
        membershipId: participant.membershipId,
        anwesend: participant.anwesend
      });
    }
  });

  const result = await getSitzungById(sitzungId);

  if (!result) {
    throw new RouteError("Sitzung konnte nicht angelegt werden.", 500, "internal-error");
  }

  return result;
}

export async function updateSitzung(command: UpdateSitzungCommand): Promise<Sitzung> {
  assertMutationPrerequisites(command.role, ["schriftfuehrer", "revier-admin"]);
  await assertEditableSitzung(command.revierId, command.sitzungId);

  await getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(sitzungen)
      .set({
        title: command.input.title,
        scheduledAt: command.input.scheduledAt,
        locationLabel: command.input.locationLabel
      })
      .where(and(eq(sitzungen.revierId, command.revierId), eq(sitzungen.id, command.sitzungId)))
      .returning();

    if (!updated) {
      throw new RouteError("Sitzung wurde nicht gefunden.", 404, "not-found");
    }

    await tx.delete(sitzungTeilnehmer).where(eq(sitzungTeilnehmer.sitzungId, command.sitzungId));

    for (const participant of command.input.participants) {
      await tx.insert(sitzungTeilnehmer).values({
        id: `${command.sitzungId}-${participant.membershipId}`,
        sitzungId: command.sitzungId,
        membershipId: participant.membershipId,
        anwesend: participant.anwesend
      });
    }
  });

  const result = await getSitzungById(command.sitzungId);

  if (!result) {
    throw new RouteError("Sitzung wurde nicht gefunden.", 404, "not-found");
  }

  return result;
}

export async function createSitzungVersion(command: CreateVersionCommand): Promise<Sitzung> {
  assertMutationPrerequisites(command.role, ["schriftfuehrer", "revier-admin"]);
  await assertEditableSitzung(command.revierId, command.sitzungId);

  const versionId = `version-${randomUUID()}`;

  await getDb().transaction(async (tx) => {
    await tx.insert(protokollVersionen).values({
      id: versionId,
      sitzungId: command.sitzungId,
      createdAt: new Date().toISOString(),
      createdByMembershipId: command.membershipId,
      summary: command.input.summary,
      agendaText: command.input.agenda.join("\n")
    });

    for (const beschluss of command.input.beschluesse) {
      await tx.insert(protokollBeschluesse).values({
        id: `beschluss-${randomUUID()}`,
        versionId,
        title: beschluss.title,
        decision: beschluss.decision,
        owner: beschluss.owner ?? null,
        dueAt: beschluss.dueAt ?? null
      });
    }
  });

  const result = await getSitzungById(command.sitzungId);

  if (!result) {
    throw new RouteError("Sitzung wurde nicht gefunden.", 404, "not-found");
  }

  return result;
}

export async function freigebenSitzung(command: FreigabeCommand): Promise<Sitzung> {
  assertMutationPrerequisites(command.role, ["revier-admin"]);
  const sitzung = await assertEditableSitzung(command.revierId, command.sitzungId);

  if (sitzung.versions.length === 0) {
    throw new RouteError("Vor der Freigabe muss mindestens eine Protokollversion existieren.", 409, "conflict");
  }

  if (sitzung.status === "freigegeben") {
    return sitzung;
  }

  await getDb().transaction(async (tx) => {
    await tx
      .update(sitzungen)
      .set({
        status: "freigegeben"
      })
      .where(and(eq(sitzungen.revierId, command.revierId), eq(sitzungen.id, command.sitzungId)));

    const documentId = `document-${command.sitzungId}`;
    const latestVersionId = sitzung.versions[0]?.id ?? null;

    await tx
      .insert(dokumente)
      .values({
        id: documentId,
        sitzungId: command.sitzungId,
        versionId: latestVersionId,
        kind: "published-protocol",
        title: `${sitzung.title} Protokoll`,
        fileName: `${slugify(sitzung.title)}.pdf`,
        contentType: "application/pdf",
        createdAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: dokumente.id,
        set: {
          sitzungId: command.sitzungId,
          versionId: latestVersionId,
          kind: "published-protocol",
          title: `${sitzung.title} Protokoll`,
          fileName: `${slugify(sitzung.title)}.pdf`,
          contentType: "application/pdf",
          createdAt: new Date().toISOString()
        }
      });
  });

  const result = await getSitzungById(command.sitzungId);

  if (!result) {
    throw new RouteError("Sitzung wurde nicht gefunden.", 404, "not-found");
  }

  return result;
}

function assertMutationPrerequisites(role: Role, allowedRoles: Role[]) {
  if (getServerEnv().useDemoStore) {
    throw new RouteError("Sitzungs-Mutationen benoetigen eine aktive Datenbank.", 503, "service-unavailable");
  }

  assertRole(role, allowedRoles);
}

async function assertEditableSitzung(revierId: string, sitzungId: string) {
  const sitzung = await getSitzungById(sitzungId);

  if (!sitzung || sitzung.revierId !== revierId) {
    throw new RouteError("Sitzung wurde nicht gefunden.", 404, "not-found");
  }

  return sitzung;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
