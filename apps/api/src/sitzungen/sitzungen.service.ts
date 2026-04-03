import { Injectable } from "@nestjs/common";
import { publishSitzung } from "@ferm/domain";

import { DemoStoreService } from "../common/demo-store.service";

@Injectable()
export class SitzungenService {
  constructor(private readonly store: DemoStoreService) {}

  list(revierId = this.store.revierId) {
    return this.store.snapshot.sitzungen
      .filter((entry) => entry.revierId === revierId)
      .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
  }

  publish(sitzungId: string, createdAt: string) {
    return publishSitzung(this.store.snapshot, sitzungId, createdAt);
  }
}
