import { Injectable } from "@nestjs/common";
import { endAnsitz, startAnsitz, type EndAnsitzPayload, type StartAnsitzPayload } from "@hege/domain";

import { DemoStoreService } from "../common/demo-store.service";
import { AnsitzeGateway } from "./ansitze.gateway";

@Injectable()
export class AnsitzeService {
  constructor(
    private readonly store: DemoStoreService,
    private readonly gateway: AnsitzeGateway
  ) {}

  list(revierId = this.store.revierId) {
    return this.store.snapshot.ansitze
      .filter((entry) => entry.revierId === revierId)
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
  }

  listActive(revierId = this.store.revierId) {
    return this.list(revierId).filter((entry) => entry.status === "active");
  }

  start(payload: StartAnsitzPayload) {
    const session = startAnsitz(this.store.snapshot, payload);
    this.gateway.broadcastSessions(payload.revierId, this.listActive(payload.revierId));

    return session;
  }

  end(ansitzId: string, payload: EndAnsitzPayload) {
    const session = endAnsitz(this.store.snapshot, ansitzId, payload);
    this.gateway.broadcastSessions(session.revierId, this.listActive(session.revierId));

    return session;
  }
}
