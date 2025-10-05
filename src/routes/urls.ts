import type { FastifyInstance } from 'fastify';
import { shortenUrl, redirectUrl, getUrlStats, getAllUrls } from '../controllers/urlsController';

export async function urlRoutes(fastify: FastifyInstance) {
  fastify.post('/shorten', shortenUrl);
  fastify.get('/stats/:code', getUrlStats);
  fastify.get('/all', getAllUrls);
  fastify.get('/:code', redirectUrl);
}