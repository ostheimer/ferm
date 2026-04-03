import { Controller, Get, Query } from "@nestjs/common";

import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOverview(@Query("revierId") revierId?: string) {
    return this.dashboardService.getOverview(revierId);
  }
}
