# 🔧 Backend - URL Shortener API

> API REST robusta y rápida construida con Fastify, PostgreSQL y Drizzle ORM

## 🚀 Stack Tecnológico

- **Fastify** - Framework web ultrarrápido (~30k req/seg)
- **PostgreSQL** - Base de datos relacional
- **Drizzle ORM** - ORM TypeScript-first, type-safe
- **Zod** - Validación de esquemas robusta
- **nanoid** - Generador de IDs únicos y seguros
- **TypeScript** - Tipado estático completo

---

## 🗂️ Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   └── urlsController.ts    # Lógica de negocio
│   ├── db/
│   │   ├── client.ts             # Cliente Drizzle
│   │   └── schema.ts             # Definición del schema
│   ├── routes/
│   │   └── urls.ts               # Definición de rutas
│   ├── schemas/
│   │   └── urlSchema.ts          # Validaciones Zod
│   ├── utils/
│   │   └── generateCode.ts       # Generador de códigos
│   └── server.ts                 # Entry point
├── drizzle/                      # Migraciones generadas
├── drizzle.config.ts             # Config de Drizzle
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

---

## 📦 Instalación Rápida

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL

# Aplicar esquema a la base de datos
npm run db:push

# Iniciar servidor
npm run dev
```

🎉 Servidor corriendo en `http://localhost:3000`

---

## 🌍 Variables de Entorno

Crea un archivo `.env`:

```env
# Database - Obtén esto de Neon.tech (gratis)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# Optional: Node Environment
NODE_ENV=development
```

### Obtener DATABASE_URL de Neon

1. Ve a [https://neon.tech](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la "Connection String" de PostgreSQL
5. Pégala en tu `.env` como `DATABASE_URL`

---

## 📡 API Endpoints

### `POST /shorten`

Acorta una URL larga.

**Request:**

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ejemplo.com/articulo"}'
```

**Response (201):**

```json
{
  "shortUrl": "http://localhost:3000/a1B2c3"
}
```

**Errores:**

- `400` - URL inválida o faltante
- `500` - Error del servidor

---

### `GET /:code`

Redirige a la URL original.

**Request:**

```bash
curl -L http://localhost:3000/a1B2c3
```

**Response:**

- `302` - Redirección a URL original
- `404` - Código no encontrado

**Efecto secundario:** Incrementa `click_count` en 1

---

### `GET /stats/:code`

Obtiene estadísticas de una URL.

**Request:**

```bash
curl http://localhost:3000/stats/a1B2c3
```

**Response (200):**

```json
{
  "originalUrl": "https://www.ejemplo.com/articulo",
  "shortCode": "a1B2c3",
  "clickCount": 42,
  "createdAt": "2025-10-04T15:30:00.000Z"
}
```

**Errores:**

- `404` - Código no encontrado

---

### `GET /all`

Lista todas las URLs con estadísticas.

**Request:**

```bash
curl http://localhost:3000/all
```

**Response (200):**

```json
{
  "total": 5,
  "urls": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originalUrl": "https://ejemplo.com",
      "shortCode": "a1B2c3",
      "clickCount": 42,
      "createdAt": "2025-10-04T15:30:00.000Z",
      "shortUrl": "http://localhost:3000/a1B2c3"
    }
  ]
}
```

---

### `GET /health`

Health check del servidor.

**Request:**

```bash
curl http://localhost:3000/health
```

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-10-05T10:30:00.000Z"
}
```

---

## 📊 Esquema de Base de Datos

```sql
CREATE TABLE urls (
  id UUID PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL,
  short_code VARCHAR(10) NOT NULL UNIQUE,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_short_code ON urls(short_code);
```

### Campos

- `id` - UUID único para cada registro
- `original_url` - URL original (max 2048 caracteres)
- `short_code` - Código corto único (6 caracteres por defecto)
- `click_count` - Contador de clics (inicia en 0)
- `created_at` - Timestamp de creación

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia con hot-reload (tsx watch)

# Producción
npm run build            # Compila TypeScript → JavaScript
npm start                # Ejecuta versión compilada

# Base de datos
npm run db:generate      # Genera migraciones SQL
npm run db:push          # Aplica cambios a la BD

```

---

## 🔐 Seguridad

### Implementadas

✅ **Validación de URLs** - Zod verifica formato de URL  
✅ **SQL Injection** - Drizzle ORM protege queries  
✅ **CORS** - Configurado para orígenes específicos  
✅ **Códigos únicos** - nanoid genera IDs seguros (URL-safe)  
✅ **Error handling** - @fastify/sensible maneja errores

## 🚀 Despliegue

### Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

Variables de entorno en Railway:

- `DATABASE_URL` - Tu connection string
- `BASE_URL` - https://tu-app.railway.app

### Render

1. Conecta GitHub en [render.com](https://render.com)
2. New → Web Service
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Agrega `DATABASE_URL` en Environment

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t url-shortener-api .
docker run -p 3000:3000 --env-file .env url-shortener-api
```

## 🐛 Troubleshooting

### "Cannot connect to database"

```bash
# Verifica la conexión
psql $DATABASE_URL

# O con node
node -e "console.log(process.env.DATABASE_URL)"
```

### "Port 3000 already in use"

```bash
# Encuentra el proceso
lsof -i :3000

# Mata el proceso
kill -9 <PID>

# O cambia el puerto en .env
PORT=3001
```

### "Module not found"

```bash
# Limpia e reinstala
rm -rf node_modules package-lock.json
npm install
```

### "Drizzle migrations fail"

```bash
# Resetea y regenera
npm run db:generate
npm run db:push
```

---

## 📚 Documentación Adicional

- [Fastify Docs](https://fastify.dev/docs/latest/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Zod](https://zod.dev)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [nanoid](https://github.com/ai/nanoid)

---

Desarrollado con ❤️ usando Fastify + PostgreSQL + TypeScript
