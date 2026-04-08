import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = req.nextUrl.pathname === '/auth/login';

  // Session байхгүй бол /admin руу орохыг оролдвол login руу шидэх
  if (!session && isAdminPath) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Session байгаа үед role шалгах
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isAdmin =
      profile?.role === 'super_admin' || profile?.role === 'manager';

    // Admin хэрэглэгч login хуудас руу орвол /admin руу шидэх
    if (isLoginPath && isAdmin) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }

    // Admin биш хэрэглэгч /admin руу орвол login руу шидэх
    if (isAdminPath && !isAdmin) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/auth/login'],
};