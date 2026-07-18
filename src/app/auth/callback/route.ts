import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType, type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getAppOrigin } from "@/lib/app-url";
import { completeJoinForUser } from "@/lib/complete-join";

function createCallbackClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

/** Prefer public app URL — Render's request.url is often localhost:10000. */
function publicUrl(path: string): URL {
  const origin = getAppOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${origin}/`);
}

async function finishAuth(
  request: NextRequest,
  response: NextResponse,
  user: User,
) {
  if (!user.email) {
    const failed = NextResponse.redirect(
      publicUrl("/login?error=auth&detail=missing-email"),
    );
    copyCookies(response, failed);
    return failed;
  }

  const completed = await completeJoinForUser({
    userId: user.id,
    email: user.email,
  });

  // completeJoinForUser no-ops if the member already exists
  if (!completed.ok) {
    const url = publicUrl("/join");
    url.searchParams.set("error", completed.error);
    const redirect = NextResponse.redirect(url);
    copyCookies(response, redirect);
    return redirect;
  }

  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const successRedirect = NextResponse.redirect(publicUrl(next));

  if (code) {
    const supabase = createCallbackClient(request, successRedirect);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      const url = publicUrl("/login");
      url.searchParams.set("error", "auth");
      url.searchParams.set(
        "detail",
        error?.message ?? "Could not verify the magic link. Request a new one.",
      );
      return NextResponse.redirect(url);
    }

    return finishAuth(request, successRedirect, data.user);
  }

  if (tokenHash && type) {
    const supabase = createCallbackClient(request, successRedirect);
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error || !data.user) {
      const url = publicUrl("/login");
      url.searchParams.set("error", "auth");
      url.searchParams.set(
        "detail",
        error?.message ?? "Could not verify the email link. Request a new one.",
      );
      return NextResponse.redirect(url);
    }

    return finishAuth(request, successRedirect, data.user);
  }

  return NextResponse.redirect(
    publicUrl("/login?error=auth&detail=missing-code"),
  );
}
