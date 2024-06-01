import { assertPowerStatus, type PowerStatus } from "@app/common";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("main-element")
export class MainElement extends LitElement {

  powerStatus: PowerStatus = { status: "unknown" };
  timer: number | undefined = undefined;

  constructor() {
    super();
    this.updateStatus();
  }

  async updateStatus(): Promise<void> {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    try {
      const response = await fetch("/status", { signal: AbortSignal.timeout(1000) });
      const data = await response.json() as unknown;
      assertPowerStatus(data);
      this.powerStatus = data;
    } catch {
      this.powerStatus = { status: "unknown" };
    }
    this.requestUpdate();
    this.timer = setTimeout(() => this.updateStatus(), 1000);
  }

  protected override render() {
    switch (this.powerStatus.status) {
      case "unknown": return html`<h1>Unknown</h1>`;
      case "stopped": return html`<h1>Stopped</h1>`;
      case "starting": return html`<h1>Starting</h1>`;
      case "started": return html`<h1>Started</h1>`;
      case "stopping": return html`<h1>Stopped</h1>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "main-element": MainElement;
  }
}