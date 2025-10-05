import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: uuid('id').primaryKey(),
  originalUrl: varchar('original_url', { length: 2048 }).notNull(),
  shortCode: varchar('short_code', { length: 10 }).notNull().unique(),
  clickCount: integer('click_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});