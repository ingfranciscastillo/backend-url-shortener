import { nanoid } from 'nanoid';

export function generateShortCode(length: number = 6): string {
  return nanoid(length);
}