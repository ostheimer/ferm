import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type { AddKontrollePayload } from "@hege/domain";

import { ReviereinrichtungenService } from "./reviereinrichtungen.service";

@Controller("reviereinrichtungen")
export class ReviereinrichtungenController {
  constructor(private readonly reviereinrichtungenService: ReviereinrichtungenService) {}

  @Get()
  list(@Query("revierId") revierId?: string) {
    return this.reviereinrichtungenService.list(revierId);
  }

  @Post(":id/kontrollen")
  addKontrolle(@Param("id") einrichtungId: string, @Body() payload: AddKontrollePayload) {
    return this.reviereinrichtungenService.addKontrolle(einrichtungId, payload);
  }
}
