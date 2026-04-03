import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { EndAnsitzPayload, StartAnsitzPayload } from "@hege/domain";

import { AnsitzeService } from "./ansitze.service";

@Controller("ansitze")
export class AnsitzeController {
  constructor(private readonly ansitzeService: AnsitzeService) {}

  @Get()
  list(@Query("revierId") revierId?: string) {
    return this.ansitzeService.list(revierId);
  }

  @Get("live")
  listActive(@Query("revierId") revierId?: string) {
    return this.ansitzeService.listActive(revierId);
  }

  @Post()
  start(@Body() payload: StartAnsitzPayload) {
    return this.ansitzeService.start(payload);
  }

  @Patch(":id/beenden")
  end(@Param("id") ansitzId: string, @Body() payload: EndAnsitzPayload) {
    return this.ansitzeService.end(ansitzId, payload);
  }
}
