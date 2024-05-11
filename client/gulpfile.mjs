import { tasks, tools } from "@iiimaddiniii/js-build-tool";

export const build = tools.exitAfter(
  tasks.rollup.build({ environment: "browser", type: "app" }));
