import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export function isValidInviteCode(code: string): boolean {
  const expected = process.env.TEAM_INVITE_CODE;
  if (!expected) {
    return false;
  }
  return code.trim() === expected;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentMember(): Promise<Member | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("members")
    .select("id, email, display_name, display_name_changed_at, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function requireMember(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/login");
  }
  return member;
}
