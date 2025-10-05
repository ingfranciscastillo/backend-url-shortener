import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import { urlRoutes } from "./routes/urls";

dotenv.config();

const fastify = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

await fastify.register(urlRoutes);

await fastify.register(cors, {
  origin: true,
});

await fastify.register(sensible);

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  errorResponseBuilder: (req, context) => {
    return {
      code: 429,
      error: "Too Many Requests",
      message: `Has excedido el límite de ${context.max} peticiones por minuto.`,
    };
  },
});

// Health check
fastify.get("/health", async (request, reply) => {
  return reply.send({ status: "ok", timestamp: new Date().toISOString() });
});

// Iniciar servidor
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
