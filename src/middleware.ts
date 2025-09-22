import { NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {
          // no-op or implement if needed
        },
      },
    }
  )

  const { data } = await supabase.auth.getSession()

  // Redirect unauthenticated users trying to access protected routes to login
  if (!data.session && !req.nextUrl.pathname.startsWith('/login')) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from login page (to dashboard)
  if (data.session && req.nextUrl.pathname.startsWith('/login')) {
    const dashboardUrl = req.nextUrl.clone()
    dashboardUrl.pathname = '/manage/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return res
}

export const config = {
  matcher: ['/manage/:path*', '/login'], // protect these routes + login for redirect
}
