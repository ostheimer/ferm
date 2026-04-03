import { calculateAnsitzConflict, type AnsitzSession } from "@hege/domain";
import { randomUUID } from "crypto";

import { getServerEnv } from "../../env";
import { createDbAnsitzeRepository, type AnsitzeRepository } from "./repository";
import type { CreateAnsitzInput, EndAnsitzInput } from "./schemas";

export class AnsitzServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

interface CreateAnsitzCommand extends CreateAnsitzInput {
  membershipId: string;
  revierId: string;
}

interface EndAnsitzCommand extends EndAnsitzInput {
  ansitzId: string;
  revierId: string;
}

interface AnsitzeServiceOptions {
  generateId?: () => string;
  getNow?: () => string;
  repository?: AnsitzeRepository;
  useDemoStore?: boolean;
}

export function createAnsitzeService({
  repository = createDbAnsitzeRepository(),
  generateId = () => `ansitz-${randomUUID()}`,
  getNow = () => new Date().toISOString(),
  useDemoStore = getServerEnv().useDemoStore
}: AnsitzeServiceOptions = {}) {
  return {
    async end(command: EndAnsitzCommand): Promise<AnsitzSession> {
      assertMutationsEnabled(useDemoStore);

      const existing = await repository.findById(command.revierId, command.ansitzId);

      if (!existing) {
        throw new AnsitzServiceError("Ansitz wurde nicht gefunden.", 404);
      }

      if (existing.status !== "active") {
        throw new AnsitzServiceError("Nur aktive Ansitze koennen beendet werden.", 409);
      }

      const endedAt = command.endedAt ?? getNow();

      if (new Date(endedAt).valueOf() < new Date(existing.startedAt).valueOf()) {
        throw new AnsitzServiceError("endedAt darf nicht vor startedAt liegen.", 400);
      }

      const updated = await repository.markCompleted(command.revierId, command.ansitzId, endedAt);

      if (!updated) {
        throw new AnsitzServiceError("Ansitz konnte nicht beendet werden.", 404);
      }

      return updated;
    },

    async start(command: CreateAnsitzCommand): Promise<AnsitzSession> {
      assertMutationsEnabled(useDemoStore);

      const startedAt = command.startedAt ?? getNow();

      if (command.plannedEndAt && new Date(command.plannedEndAt).valueOf() <= new Date(startedAt).valueOf()) {
        throw new AnsitzServiceError("plannedEndAt muss nach startedAt liegen.", 400);
      }

      const activeSessions = await repository.listActiveByRevier(command.revierId);
      const conflict = calculateAnsitzConflict(
        {
          standortId: command.standortId,
          location: command.location
        },
        activeSessions
      );

      return repository.insert({
        id: generateId(),
        revierId: command.revierId,
        membershipId: command.membershipId,
        standortId: command.standortId,
        standortName: command.standortName,
        location: command.location,
        startedAt,
        plannedEndAt: command.plannedEndAt,
        note: command.note,
        status: "active",
        conflict
      });
    }
  };
}

const defaultService = createAnsitzeService();

export async function endAnsitzSession(command: EndAnsitzCommand) {
  return defaultService.end(command);
}

export async function startAnsitzSession(command: CreateAnsitzCommand) {
  return defaultService.start(command);
}

function assertMutationsEnabled(useDemoStore: boolean) {
  if (useDemoStore) {
    throw new AnsitzServiceError("Ansitz-Mutationen benoetigen eine aktive Datenbank.", 503);
  }
}
