import { createServiceClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/utils";

export async function completeJoinForUser(params: {
  userId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(params.email);
  const service = createServiceClient();

  const { data: existing } = await service
    .from("members")
    .select("id")
    .eq("id", params.userId)
    .maybeSingle();

  if (existing) {
    return { ok: true };
  }

  const { data: intent } = await service
    .from("join_intents")
    .select("display_name, expires_at")
    .eq("email", email)
    .maybeSingle();

  if (!intent) {
    return {
      ok: false,
      error: "Join session not found. Start again with your invite code.",
    };
  }

  if (new Date(intent.expires_at).getTime() < Date.now()) {
    await service.from("join_intents").delete().eq("email", email);
    return {
      ok: false,
      error: "Join session expired. Start again with your invite code.",
    };
  }

  const { error: memberError } = await service.from("members").upsert({
    id: params.userId,
    email,
    display_name: intent.display_name,
  });

  if (memberError) {
    return { ok: false, error: memberError.message };
  }

  await service.from("join_intents").delete().eq("email", email);
  return { ok: true };
}

