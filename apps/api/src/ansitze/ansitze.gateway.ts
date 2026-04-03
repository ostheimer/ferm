import { Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { AnsitzSession } from "@ferm/domain";
import type { Server } from "socket.io";

@Injectable()
@WebSocketGateway({
  namespace: "ansitze",
  cors: {
    origin: "*"
  }
})
export class AnsitzeGateway {
  @WebSocketServer()
  private server?: Server;

  broadcastSessions(revierId: string, sessions: AnsitzSession[]) {
    this.server?.emit("ansitze.updated", {
      revierId,
      sessions
    });
  }
}
