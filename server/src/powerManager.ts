import type { PowerStatus } from "@app/common";
import { FormatRegistry, Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { readFile, writeFile } from "fs/promises";
import { request } from "http";

// Generated by:
// https://sinclairzx81.github.io/typebox-workbench/?share=ZXhwb3J0IHR5cGUgUG93ZXJNYW5hZ2VyT3B0aW9ucyA9IHsKICAvKioKICAgKiBAZm9ybWF0IHVybAogICAqLwogIHN0YXJ0U2VydmVyVXJsOiBzdHJpbmc7CiAgc3RhcnRUaW1lcjogbnVtYmVyOwogIC8qKiAKICAgKiBAZm9ybWF0IHVybCAKICAgKi8KICBwaW5nVXJsOiBzdHJpbmc7CiAgcGluZ1RpbWVvdXQ6IG51bWJlcjsKICBjb25uZWN0ZWRUaW1lcjogbnVtYmVyOwogIGRpc2Nvbm5lY3RlZFRpbWVyOiBudW1iZXI7Cn07
// export type PowerManagerOptions = {
//   /**
//    * @format url
//    */
//   startServerUrl: string;
//   startTimer: number;
//   /** 
//    * @format url 
//    */
//   pingUrl: string;
//   pingTimeout: number;
//   connectedTimer: number;
//   disconnectedTimer: number;
// };
export type PowerManagerOptions = Static<typeof PowerManagerOptions>;
export const PowerManagerOptions = Type.Object({
  startServerUrl: Type.String({ format: 'url' }),
  startTimer: Type.Number(),
  pingUrl: Type.String({ format: 'url' }),
  pingTimeout: Type.Number(),
  connectedTimer: Type.Number(),
  disconnectedTimer: Type.Number()
});

FormatRegistry.Set("url", (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
});

function assertPowerManagerOptions(options: unknown): asserts options is PowerManagerOptions {
  const error = Value.Errors(PowerManagerOptions, options).First();
  if (error !== undefined) throw new Error(`${error.path.slice(1).replaceAll("/", ".")}: ${error.message}`);
}

const UpdateTimes = {
  "unknown": 1000,
  "unknown=>connected": 1000,
  "unknown=>disconnected": 1000,
  "connected": 60000,
  "disconnected": 60000,
  "disconnected=>connecting": 1000,
  "connecting=>connected": 1000,
};

const manualModeFile = "./manualMode";

export class PowerManager {
  static getOptionsFromEnv(): PowerManagerOptions {
    const opts = {
      startServerUrl: process.env["START_SERVER_URL"],
      startTimer: Number(process.env["START_TIMER"]),
      pingUrl: process.env["PING_URL"],
      pingTimeout: Number(process.env["PING_TIMEOUT"]),
      connectedTimer: Number(process.env["CONNECTED_TIMER"]),
      disconnectedTimer: Number(process.env["DISCONNECTED_TIMER"]),
    };
    assertPowerManagerOptions(opts);
    return opts;
  }

  #options: PowerManagerOptions;
  #timer: NodeJS.Timeout | undefined = undefined;
  #statusChangeTimer: number = new Date().getTime();
  #status: "unknown" | "unknown=>connected" | "unknown=>disconnected" | "connected" | "disconnected" | "disconnected=>connecting" | "connecting=>connected" = "unknown";
  #manualMode: boolean = false;

  async init() {
    try {
      const file = await readFile(manualModeFile, { encoding: "utf8" });
      const value = JSON.parse(file);
      if (typeof value !== "boolean") throw new Error("Value is not Boolean");
      this.#manualMode = value;
    } catch { }
  }

  constructor(options: PowerManagerOptions = PowerManager.getOptionsFromEnv()) {
    this.#options = options;
    this.#updateStatus();
  }

  getStatus(): PowerStatus {
    switch (this.#status) {
      case "unknown": return { status: "unknown", manualMode: this.#manualMode };
      case "unknown=>connected": return { status: "unknown", manualMode: this.#manualMode };
      case "unknown=>disconnected": return { status: "unknown", manualMode: this.#manualMode };
      case "connected": return { status: "started", manualMode: this.#manualMode };
      case "disconnected": return { status: "stopped", manualMode: this.#manualMode };
      case "disconnected=>connecting": return { status: "starting", manualMode: this.#manualMode };
      case "connecting=>connected": return { status: "starting", manualMode: this.#manualMode };
    }
  }

  async #updateStatus() {
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
    this.#stateMachine(await this.#pingServer());
    this.#timer = setTimeout(() => this.#updateStatus(), UpdateTimes[this.#status]);
  }

  #stateMachine(pingResult: boolean): void {
    console.log("stateMachine", pingResult, this.#status, this.#statusChangeTimer, new Date().getTime());
    switch (this.#status) {
      case "unknown":
        if (pingResult) {
          this.#status = "unknown=>connected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.connectedTimer;
          return;
        }
        this.#status = "unknown=>disconnected";
        this.#statusChangeTimer = new Date().getTime() + this.#options.disconnectedTimer;
        return;
      case "unknown=>connected":
        if (!pingResult) {
          this.#status = "unknown=>disconnected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.disconnectedTimer;
          return;
        }
        if (this.#statusChangeTimer <= new Date().getTime()) {
          this.#status = "connected";
          return;
        }
        return;
      case "unknown=>disconnected":
        if (pingResult) {
          this.#status = "unknown=>connected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.connectedTimer;
          return;
        }
        if (this.#statusChangeTimer <= new Date().getTime()) {
          this.#status = "disconnected";
          return;
        }
        return;
      case "connected":
        if (!pingResult) {
          this.#status = "unknown=>disconnected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.disconnectedTimer;
          return;
        }
        return;
      case "disconnected":
        if (pingResult) {
          this.#status = "unknown=>connected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.connectedTimer;
          return;
        }
        if (this.#manualMode) {
          this.#startServer();
          return;
        }
        return;
      case "disconnected=>connecting":
        if (pingResult) {
          this.#status = "connecting=>connected";
          this.#statusChangeTimer = new Date().getTime() + this.#options.connectedTimer;
          return;
        }
        if (this.#statusChangeTimer <= new Date().getTime()) {
          this.#startServer();
          return;
        }
        return;
      case "connecting=>connected":
        if (!pingResult) {
          this.#status = "disconnected=>connecting";
          this.#statusChangeTimer = new Date().getTime() + this.#options.startTimer;
          return;
        }
        if (this.#statusChangeTimer <= new Date().getTime()) {
          this.#status = "connected";
          return;
        }
        return;
    }
  }

  async #pingServer(): Promise<boolean> {
    try {
      console.log("sendPing");
      const response = await fetch(this.#options.pingUrl, { signal: AbortSignal.timeout(this.#options.pingTimeout) });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  #startServer(): void {
    if (this.#status !== "disconnected" && this.#status !== "disconnected=>connecting") throw new Error("Starting server is only possible if not connected!");
    try {
      this.#status = "disconnected=>connecting";
      this.#statusChangeTimer = new Date().getTime() + this.#options.startTimer;
      console.log("startServer");
      const req = request(this.#options.startServerUrl, { signal: AbortSignal.timeout(this.#options.pingTimeout) });
      req.on("error", () => { });
      req.end();
    } catch { }
  }

  async setManualMode(start: boolean): Promise<void> {
    await writeFile(manualModeFile, JSON.stringify(start));
    this.#manualMode = start;
    await this.#updateStatus();
  }

  async close(): Promise<void> {

  }
}