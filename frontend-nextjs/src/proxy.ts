import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy — Next.js 16+ renamed the "middleware" convention to "proxy".
 * The exported function must be named "proxy" (not "middleware").
 * Protects /dashboard routes by checking for the erp_auth cookie (set on login).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard/* routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('erp_auth')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from the login page
  if (pathname === '/login') {
    const token = request.cookies.get('erp_auth')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
