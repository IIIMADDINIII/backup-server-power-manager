import { assertPowerStatus, type PowerStatus } from "@app/common";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

@customElement("main-element")
export class MainElement extends LitElement {
  static override styles = css`
    label {
      font-size: 23px;
    }

    .switch {
      position: relative;
      display: inline-block;
      height: 1em;
      width: 1.7em;
    }

    .switch input { 
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 0.5em;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 0.8em;
      width: 0.8em;
      left: 0.1em;
      bottom: 0.1em;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #2196F3;
    }

    input:focus + .slider {
      box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .slider:before {
      transform: translateX(0.7em);
    }
  `;

  powerStatus: PowerStatus | undefined = undefined;
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
      this.powerStatus = undefined;
    }
    this.requestUpdate();
    this.timer = setTimeout(() => this.updateStatus(), 1000);
  }

  override render() {
    return html`
      ${this.renderStatus()}
      ${this.renderManualMode()}
    `;
  }

  renderManualMode() {
    if (this.powerStatus === undefined) return html``;
    return html`
    <label>
      Manual Power Status:
      <div class="switch">
        <input type="checkbox" .checked=${live(this.powerStatus.manualMode)} @change=${this.onManualModeChange}>
        <span class="slider"></span>
      </div>
    </label>
    `;
  }

  onManualModeChange(e: Event) {
    if (!isElement(e.currentTarget, "input")) return;
    fetch("/setManualMode?" + new URLSearchParams({ value: JSON.stringify(e.currentTarget.checked) })).catch(console.error);
  }

  renderStatus() {
    if (this.powerStatus === undefined) return html``;
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

/**
 * Checking if Element is of a specific Type.
 * @param elem - Element to check.
 * @param tag - the Expected Tag Name the Element should have.
 * @returns boolean indicating if element has the tag.
 */
export function isElement<T extends keyof HTMLElementTagNameMap>(elem: EventTarget | null, tag: T): elem is HTMLElementTagNameMap[T] {
  if (elem === null) return false;
  if (!(elem instanceof Element)) return false;
  if (elem.tagName.toLocaleUpperCase() !== tag.toLocaleUpperCase()) return false;
  return true;
}