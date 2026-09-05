import { neon } from '@neondatabase/serverless';

type Sql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

let client: Sql | null = null;

export function sql(): Sql {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  client = neon(url) as unknown as Sql;
  return client;
}

export function asDate(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string') return value.slice(0, 10);
  throw new Error('Invalid date value');
}

export function asTime(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.slice(0, 5);
}

export function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
