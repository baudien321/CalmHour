Creating an optimized production build ...
Failed to compile.
./middleware.ts:2:1
Module not found: Can't resolve '@supabase/ssr'
  1 | import { NextResponse, type NextRequest } from 'next/server'
> 2 | import { createServerClient } from '@supabase/ssr'
    | ^
  3 |
  4 | export async function middleware(request: NextRequest) {
  5 |   let response = NextResponse.next({