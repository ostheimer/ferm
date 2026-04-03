import type { FallwildVorgang } from "@hege/domain";
import { randomUUID } from "crypto";

import { getServerEnv } from "../../env";
import { createDbFallwildRepository, type FallwildRepository } from "./repository";
import type { CreateFallwildInput } from "./schemas";

export class FallwildServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

interface CreateFallwildCommand extends CreateFallwildInput {
  reportedByMembershipId: string;
  revierId: string;
}

interface FallwildServiceOptions {
  generateId?: () => string;
  getNow?: () => string;
  repository?: FallwildRepository;
  useDemoStore?: boolean;
}

export function createFallwildService({
  repository = createDbFallwildRepository(),
  generateId = () => `fallwild-${randomUUID()}`,
  getNow = () => new Date().toISOString(),
  useDemoStore = getServerEnv().useDemoStore
}: FallwildServiceOptions = {}) {
  return {
    async create(command: CreateFallwildCommand): Promise<FallwildVorgang> {
      assertMutationsEnabled(useDemoStore);

      const recordedAt = command.recordedAt ?? getNow();

      return repository.insert({
        id: generateId(),
        revierId: command.revierId,
        reportedByMembershipId: command.reportedByMembershipId,
        recordedAt,
        location: command.location,
        wildart: command.wildart,
        geschlecht: command.geschlecht,
        altersklasse: command.altersklasse,
        bergungsStatus: command.bergungsStatus,
        gemeinde: command.gemeinde,
        strasse: command.strasse,
        note: command.note,
        photos: []
      });
    }
  };
}

const defaultService = createFallwildService();

export async function createFallwildVorgang(command: CreateFallwildCommand) {
  return defaultService.create(command);
}

function assertMutationsEnabled(useDemoStore: boolean) {
  if (useDemoStore) {
    throw new FallwildServiceError("Fallwild-Mutationen benoetigen eine aktive Datenbank.", 503);
  }
}
