import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("main-element")
export class MainElement extends LitElement {

  protected override render() {
    return html`<h1>Hello</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "main-element": MainElement;
  }
}