import { Injectable } from "@nestjs/common";
import { createFallwild, type CreateFallwildPayload } from "@hege/domain";

import { DemoStoreService } from "../common/demo-store.service";

@Injectable()
export class FallwildService {
  constructor(private readonly store: DemoStoreService) {}

  list(revierId = this.store.revierId) {
    return this.store.snapshot.fallwild
      .filter((entry) => entry.revierId === revierId)
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  }

  create(payload: CreateFallwildPayload) {
    return createFallwild(this.store.snapshot, payload);
  }

  exportCsv(revierId = this.store.revierId): string {
    const rows = this.list(revierId);
    const header = ["ID", "Zeitpunkt", "Wildart", "Geschlecht", "Altersklasse", "Gemeinde", "Straße", "Status"];
    const lines = rows.map((entry) =>
      [
        entry.id,
        entry.recordedAt,
        entry.wildart,
        entry.geschlecht,
        entry.altersklasse,
        entry.gemeinde,
        entry.strasse ?? "",
        entry.bergungsStatus
      ].join(";")
    );

    return [header.join(";"), ...lines].join("\n");
  }
}
