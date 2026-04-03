import { Injectable } from "@nestjs/common";
import { createDemoSnapshot, defaultRevierId, type DemoData } from "@ferm/domain";

@Injectable()
export class DemoStoreService {
  private readonly data: DemoData = createDemoSnapshot();

  get revierId(): string {
    return defaultRevierId;
  }

  get snapshot(): DemoData {
    return this.data;
  }
}
