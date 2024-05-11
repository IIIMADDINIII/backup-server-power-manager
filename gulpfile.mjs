import { tasks, tools } from "@iiimaddiniii/js-build-tool";

async function runDockerUp() {
  tools.exec`docker compose up --build`;
}

export const clean = tools.exitAfter(
  tasks.cleanWithGit());

export const build = tools.exitAfter(
  tasks.installDependencies(),
  tasks.runScriptsInPackages({ "*": "build" }));

export const buildCi = tools.exitAfter(
  tasks.cleanWithGit(),
  tasks.prodInstallDependencies(),
  tasks.rollup.buildAndRunTests());

export const start = tools.exitAfter(
  runDockerUp);

export const buildAndStart = tools.exitAfter(
  tasks.installDependencies(),
  tasks.runScriptsInPackages({ "*": "build" }),
  runDockerUp);
