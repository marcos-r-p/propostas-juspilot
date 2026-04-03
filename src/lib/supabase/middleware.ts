import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse;
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Rotas públicas que não precisam de autenticação
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/p/'];
    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );
    const isApiTrackView = request.nextUrl.pathname.startsWith('/api/track-view');

    if (!user && !isPublicPath && !isApiTrackView) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    return supabaseResponse;
  }
}
