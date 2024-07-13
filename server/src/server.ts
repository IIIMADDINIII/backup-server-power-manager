import { PowerStatus } from "@app/common";
import fastifyStatic from "@fastify/static";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { PowerManager } from "./powerManager.js";

export async function createServerWithRoutes(powerManager: PowerManager) {
  const server = Fastify().withTypeProvider<TypeBoxTypeProvider>();
  server.register(fastifyStatic, { root: process.cwd(), serve: false });

  // index.html
  server.get("/", async function handler(_request, reply) {
    reply
      .type("text/html; charset=utf-8")
      .send(`<!DOCTYPE html><html><head><script type="module" src="./index.js"></script></head></html>`);
    return reply;
  });

  // index.js
  server.get("/index.js", async function handler(_request, reply) {
    return reply.sendFile("./client/dist/index.js");
  });

  // index.js.map
  server.get("/index.js.map", async function handler(_request, reply) {
    return reply.sendFile("./client/dist/index.js.map");
  });

  // Get server Power Status
  server.get("/status", { schema: { response: { 200: PowerStatus } } }, async function handler(_request, _response) {
    return powerManager.getStatus();
  });

  // Manual Start of the Server
  server.get("/setManualMode", { schema: { querystring: Type.Object({ value: Type.Boolean() }) } }, async function handler(request, _response,) {
    await powerManager.setManualMode(request.query.value);
  });

  await server.listen({ port: 80, host: "0.0.0.0" });
  return server;
}