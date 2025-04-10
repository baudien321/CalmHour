import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // DEBUG: Log environment variables in middleware context
  console.log('[Middleware] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[Middleware] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - important to do before checking getUser()
  await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes (adjust as needed)
  const protectedRoutes = ['/dashboard'] // Add other routes like /settings etc.

  // Redirect to login if user is not logged in and trying to access a protected route
  if (!user && protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path))) {
    // You might want to redirect to a specific login page if you create one
    // Or just redirect to the home page
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/' // Redirect to home page
    // Optional: Add a query param to show a message, e.g.:
    // redirectUrl.searchParams.set(`redirectedFrom`, request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and tries to access a public-only page (e.g. a dedicated login page),
  // redirect them to the dashboard (optional).
  // if (user && request.nextUrl.pathname === '/login') {
  //   const redirectUrl = request.nextUrl.clone()
  //   redirectUrl.pathname = '/dashboard'
  //   return NextResponse.redirect(redirectUrl)
  // }

  return response
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more exceptions.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    // Add specific routes you want to protect explicitly if needed
    // '/dashboard/:path*',
  ],
} 