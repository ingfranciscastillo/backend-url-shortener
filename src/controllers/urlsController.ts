import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../db/client';
import { urls } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateShortCode } from '../utils/generateCode';
import { shortenUrlSchema } from '../schemas/urlSchema';
import { randomUUID } from 'crypto';

export async function shortenUrl(request: FastifyRequest, reply: FastifyReply) {
  try {
    const validation = shortenUrlSchema.safeParse(request.body);
    
    if (!validation.success) {
      return reply.badRequest(validation.error.message);
    }

    const { url } = validation.data;
    const shortCode = generateShortCode();
    const id = randomUUID();

    await db.insert(urls).values({
      id,
      originalUrl: url,
      shortCode,
      clickCount: 0,
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    return reply.code(201).send({ shortUrl });
  } catch (error) {
    console.error('Error acortando URL:', error);
    return reply.internalServerError('Error al acortar la URL');
  }
}

export async function redirectUrl(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
  try {
    const { code } = request.params;

    const [url] = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, code))
      .limit(1);

    if (!url) {
      return reply.notFound('URL no encontrada');
    }

    // Incrementar contador de clics
    await db
      .update(urls)
      .set({ clickCount: sql`${urls.clickCount} + 1` })
      .where(eq(urls.shortCode, code));

    return reply.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirigiendo:', error);
    return reply.internalServerError('Error al redirigir');
  }
}

export async function getUrlStats(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
  try {
    const { code } = request.params;

    const [url] = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, code))
      .limit(1);

    if (!url) {
      return reply.notFound('URL no encontrada');
    }

    return reply.send({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return reply.internalServerError('Error al obtener estadísticas');
  }
}

export async function getAllUrls(request: FastifyRequest, reply: FastifyReply) {
  try {
    const allUrls = await db.select().from(urls);

    return reply.send({
      total: allUrls.length,
      urls: allUrls.map(url => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/${url.shortCode}`,
      })),
    });
  } catch (error) {
    console.error('Error obteniendo URLs:', error);
    return reply.internalServerError('Error al obtener URLs');
  }
}