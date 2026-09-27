import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isNativeAppUserAgent } from "@/lib/native-app";
import { SESSION_COOKIE_OPTIONS, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

const PROTECTED = /^\/(c|admin|clubs|account)(\/|$)/;
// The website's sales pages show the price and how to pay. The iPhone app
// can't point at another way to pay (Apple 3.1.1, decision 137), so inside it
// they lead back into the app instead.
const SALES_PAGES = /^\/(how-it-works|refunds)?$/;

// Refreshes the Supabase session cookie on every navigation and does an
// optimistic redirect for signed-out visitors. Real authorisation happens in
// pages, route handlers and RLS.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;

  if (SALES_PAGES.test(pathname) && isNativeAppUserAgent(request.headers.get("user-agent"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/clubs";
    url.search = "";
    url.hash = "";
    return NextResponse.redirect(url);
  }

  if (!data?.claims && PROTECTED.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    const club = pathname.match(/^\/c\/([^/]+)/);
    if (club) url.searchParams.set("club", club[1]);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api/cron|api/stripe|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
