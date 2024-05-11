import { tasks, tools } from "@iiimaddiniii/js-build-tool";

export const clean = tools.exitAfter(
  tasks.cleanWithGit());

export const build = tools.exitAfter(
  tasks.installDependencies(),
  tasks.runScriptsInPackages({ "*": "build" }));

export const buildCi = tools.exitAfter(
  tasks.cleanWithGit(),
  tasks.prodInstallDependencies(),
  tasks.rollup.buildAndRunTests());

export const test = tools.exitAfter(
  tasks.installDependencies(),
  tasks.rollup.buildAndRunTests());
