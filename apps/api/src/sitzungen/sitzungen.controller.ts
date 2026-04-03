import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";

import { SitzungenService } from "./sitzungen.service";

@Controller("sitzungen")
export class SitzungenController {
  constructor(private readonly sitzungenService: SitzungenService) {}

  @Get()
  list(@Query("revierId") revierId?: string) {
    return this.sitzungenService.list(revierId);
  }

  @Patch(":id/freigeben")
  publish(@Param("id") sitzungId: string, @Body("createdAt") createdAt?: string) {
    return this.sitzungenService.publish(sitzungId, createdAt ?? new Date().toISOString());
  }
}
