"use server";

import { redirect } from "next/navigation";

import { authEmailRedirectTo } from "@/lib/app-url";
import { isValidInviteCode } from "@/lib/auth";
import { completeJoinForUser } from "@/lib/complete-join";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/utils";

export type AuthActionResult =
  | { ok: true; step: "ready_for_link"; email: string; redirectTo: string }
  | { ok: true; step: "joined" | "logged_in" }
  | { ok: false; error: string };

function validatePseudonym(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Pseudonym must be at least 2 characters.";
  }
  if (trimmed.length > 40) {
    return "Pseudonym must be 40 characters or fewer.";
  }
  return null;
}

/** Validate invite + store join intent. Client sends the magic link (PKCE). */
export async function prepareJoin(
  formData: FormData,
): Promise<AuthActionResult> {
  const inviteCode = String(formData.get("inviteCode") ?? "");
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!isValidInviteCode(inviteCode)) {
    return { ok: false, error: "Invalid team invite code." };
  }

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const nameError = validatePseudonym(displayName);
  if (nameError) {
    return { ok: false, error: nameError };
  }

  const service = createServiceClient();

  const { data: existingMember } = await service
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingMember) {
    return {
      ok: false,
      error: "This email is already on the board. Use Log in instead.",
    };
  }

  const { data: nameTaken } = await service
    .from("members")
    .select("id")
    .ilike("display_name", displayName)
    .maybeSingle();

  if (nameTaken) {
    return { ok: false, error: "That pseudonym is already taken." };
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: intentError } = await service.from("join_intents").upsert({
    email,
    display_name: displayName,
    expires_at: expiresAt,
  });

  if (intentError) {
    return { ok: false, error: intentError.message };
  }

  return {
    ok: true,
    step: "ready_for_link",
    email,
    redirectTo: authEmailRedirectTo(),
  };
}

/** Confirm member exists, then client sends the magic link (PKCE). */
export async function prepareLogin(
  formData: FormData,
): Promise<AuthActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const service = createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!member) {
    return {
      ok: false,
      error: "No member found for that email. Join with an invite code first.",
    };
  }

  return {
    ok: true,
    step: "ready_for_link",
    email,
    redirectTo: authEmailRedirectTo(),
  };
}

export async function finishPendingJoin(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Sign in from the email link first." };
  }

  const completed = await completeJoinForUser({
    userId: user.id,
    email: user.email,
  });

  if (!completed.ok) {
    return completed;
  }

  return { ok: true, step: "joined" };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
