import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import type { CreateFallwildPayload } from "@hege/domain";

import { FallwildService } from "./fallwild.service";

@Controller("fallwild")
export class FallwildController {
  constructor(private readonly fallwildService: FallwildService) {}

  @Get()
  list(@Query("revierId") revierId?: string) {
    return this.fallwildService.list(revierId);
  }

  @Post()
  create(@Body() payload: CreateFallwildPayload) {
    return this.fallwildService.create(payload);
  }

  @Get("export.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  exportCsv(@Query("revierId") revierId?: string) {
    return this.fallwildService.exportCsv(revierId);
  }
}
