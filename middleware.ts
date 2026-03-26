import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)           { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${pathname}`, req.url));
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }

  // Protect profile routes
  if (pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${pathname}`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
