import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC = new Set([
  '/login',
  '/manifest.webmanifest',
  '/sw.js',
  '/favicon.ico',
]);

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('cimitri_session')?.value;
  let session: {
    mode?: unknown;
    personId?: unknown;
  } | null = null;
  const key = secretKey();
  if (token && key) {
    try {
      const { payload } = await jwtVerify(token, key);
      session = payload as { mode?: unknown; personId?: unknown };
    } catch {
      session = null;
    }
  }

  if (PUBLIC.has(pathname) || pathname === '/login') {
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/') {
    if (session.mode === 'office') {
      return NextResponse.redirect(new URL('/office/jobs', request.url));
    }
    if (session.mode === 'crew') {
      return NextResponse.redirect(
        new URL(session.personId ? '/crew' : '/crew/who', request.url),
      );
    }
    return NextResponse.redirect(new URL('/mode', request.url));
  }

  if (pathname.startsWith('/office') && session.mode !== 'office') {
    return NextResponse.redirect(new URL('/mode', request.url));
  }

  if (pathname.startsWith('/crew')) {
    if (session.mode !== 'crew') {
      return NextResponse.redirect(new URL('/mode', request.url));
    }
    if (pathname !== '/crew/who' && !session.personId) {
      return NextResponse.redirect(new URL('/crew/who', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
