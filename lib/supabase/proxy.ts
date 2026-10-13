import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];

// Refreshes the Supabase session cookie on every request and
// redirects based on whether the user is logged in.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Don't put code between createServerClient and getUser(): this call
  // is what refreshes an expired session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = AUTH_PAGES.includes(path);
  const isPublic = isAuthPage || path.startsWith("/auth");

  if (!user && !isPublic) {
    return redirectTo(request, "/login", response);
  }
  if (user && (isAuthPage || path === "/")) {
    return redirectTo(request, "/todos", response);
  }

  return response;
}

// Redirect while keeping any refreshed session cookies.
function redirectTo(request: NextRequest, path: string, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
