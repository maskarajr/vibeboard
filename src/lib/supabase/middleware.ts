import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getAppOrigin } from "@/lib/app-url";

function redirectToPath(path: string) {
  return NextResponse.redirect(new URL(path, `${getAppOrigin()}/`));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/join") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth");

  if (!user && !isAuthRoute) {
    return redirectToPath("/login");
  }

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (member && (pathname === "/join" || pathname === "/login")) {
      return redirectToPath("/");
    }

    if (!member && !isAuthRoute) {
      return redirectToPath("/join");
    }
  }

  return supabaseResponse;
}
