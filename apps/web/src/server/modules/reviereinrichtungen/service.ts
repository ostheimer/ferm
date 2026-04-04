import type { ReviereinrichtungListItem } from "@hege/domain";

import { createDbReviereinrichtungenRepository, type ReviereinrichtungenRepository } from "./repository";

export interface ReviereinrichtungenService {
  list(revierId: string): Promise<ReviereinrichtungListItem[]>;
}

interface ReviereinrichtungenServiceOptions {
  repository?: ReviereinrichtungenRepository;
}

export function createReviereinrichtungenService({
  repository = createDbReviereinrichtungenRepository()
}: ReviereinrichtungenServiceOptions = {}): ReviereinrichtungenService {
  return {
    async list(revierId) {
      return repository.listByRevier(revierId);
    }
  };
}
