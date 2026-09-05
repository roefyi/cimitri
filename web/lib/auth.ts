import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import type { Mode } from '@/lib/types';

const COOKIE = 'cimitri_session';

export type SessionPayload = {
  shopId: string;
  shopName: string;
  email: string;
  mode: Mode | null;
  personId: string | null;
  personName: string | null;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function writeSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(secretKey());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.shopId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.shopName !== 'string'
    ) {
      return null;
    }
    return {
      shopId: payload.shopId,
      shopName: payload.shopName,
      email: payload.email,
      mode: payload.mode === 'office' || payload.mode === 'crew' ? payload.mode : null,
      personId: typeof payload.personId === 'string' ? payload.personId : null,
      personName: typeof payload.personName === 'string' ? payload.personName : null,
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  cookies().delete(COOKIE);
}
