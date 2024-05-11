import fastifyStatic from "@fastify/static";
import Fastify from 'fastify';

const server = Fastify();

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

try {
  await server.listen({ port: 80, host: "0.0.0.0" });
} catch (e) {
  console.error(e);
  process.exit(-1);
}