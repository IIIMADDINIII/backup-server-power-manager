import Fastify from 'fastify';

const server = Fastify();
server.get("/", async function handler(_request, _reply) {
  return { hello: 'world' };
});

try {
  await server.listen({ port: 80, host: "0.0.0.0" });
} catch (e) {
  console.error(e);
  process.exit(-1);
}