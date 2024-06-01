import { css } from "lit";
import { MainElement } from "./mainElement.js";

async function main() {
  const main = new MainElement();
  document.body.append(main);
  setDocumentStyles();
}

function setDocumentStyles() {
  const styleSheet = css``.styleSheet;
  if (styleSheet === undefined) throw new Error("Error while creating Document Styles");
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
}

main().catch(console.error);