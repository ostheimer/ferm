import { Injectable } from "@nestjs/common";
import { buildDashboardOverview } from "@ferm/domain";

import { DemoStoreService } from "../common/demo-store.service";

@Injectable()
export class DashboardService {
  constructor(private readonly store: DemoStoreService) {}

  getOverview(revierId = this.store.revierId) {
    return buildDashboardOverview(this.store.snapshot, revierId);
  }
}
