import type { PowerStatus } from "@app/common";
import { FormatRegistry, Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

// Generated by:
// https://sinclairzx81.github.io/typebox-workbench/?share=ZXhwb3J0IHR5cGUgUG93ZXJNYW5hZ2VyT3B0aW9ucyA9IHsKICBzdGFydFNlcnZlclVybDogc3RyaW5nOwp9Ow%3D%3D
// export type PowerManagerOptions = {
//   startServerUrl: string;
// };
export type PowerManagerOptions = Static<typeof PowerManagerOptions>;
const PowerManagerOptions = Type.Object({
  startServerUrl: Type.String({ format: "url" })
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

export class PowerManager {
  static getOptionsFromEnv(): PowerManagerOptions {
    const opts = {
      startServerUrl: process.env["START_SERVER_URL"],
    };
    assertPowerManagerOptions(opts);
    return opts;
  }

  //@ts-ignore
  #options: PowerManagerOptions;

  constructor(options: PowerManagerOptions = PowerManager.getOptionsFromEnv()) {
    this.#options = options;
  }

  getStatus(): PowerStatus {
    return { status: "unknown" };
  }

  async close(): Promise<void> {

  }
}