import { Module } from "@nestjs/common";

import { AnsitzeController } from "./ansitze/ansitze.controller";
import { AnsitzeGateway } from "./ansitze/ansitze.gateway";
import { AnsitzeService } from "./ansitze/ansitze.service";
import { DemoStoreService } from "./common/demo-store.service";
import { DashboardController } from "./dashboard/dashboard.controller";
import { DashboardService } from "./dashboard/dashboard.service";
import { FallwildController } from "./fallwild/fallwild.controller";
import { FallwildService } from "./fallwild/fallwild.service";
import { ReviereinrichtungenController } from "./reviereinrichtungen/reviereinrichtungen.controller";
import { ReviereinrichtungenService } from "./reviereinrichtungen/reviereinrichtungen.service";
import { SitzungenController } from "./sitzungen/sitzungen.controller";
import { SitzungenService } from "./sitzungen/sitzungen.service";

@Module({
  imports: [],
  controllers: [
    DashboardController,
    AnsitzeController,
    ReviereinrichtungenController,
    FallwildController,
    SitzungenController
  ],
  providers: [
    DemoStoreService,
    DashboardService,
    AnsitzeService,
    AnsitzeGateway,
    ReviereinrichtungenService,
    FallwildService,
    SitzungenService
  ]
})
export class AppModule {}
