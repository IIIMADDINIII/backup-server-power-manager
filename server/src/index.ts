import { PowerManager } from "./powerManager.js";
import { createServerWithRoutes } from "./server.js";


async function main(): Promise<number> {
  const powerManager = new PowerManager();
  await powerManager.init();
  const server = await createServerWithRoutes(powerManager);
  await new Promise((res) => process.once("SIGINT", res));
  await server.close();
  await powerManager.close();
  return 0;
}


main().then(process.exit).catch((e) => {
  console.error(e);
  process.exit(-1);
});
