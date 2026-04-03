import { Injectable } from "@nestjs/common";
import { addKontrolle, type AddKontrollePayload } from "@hege/domain";

import { DemoStoreService } from "../common/demo-store.service";

@Injectable()
export class ReviereinrichtungenService {
  constructor(private readonly store: DemoStoreService) {}

  list(revierId = this.store.revierId) {
    return this.store.snapshot.reviereinrichtungen.filter((entry) => entry.revierId === revierId);
  }

  addKontrolle(einrichtungId: string, payload: AddKontrollePayload) {
    return addKontrolle(this.store.snapshot, einrichtungId, payload);
  }
}
