"use server";

import { revalidatePath } from "next/cache";

import { requireMember } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  formatCooldownDate,
  isUsernameCooldownActive,
  usernameCooldownEndsAt,
  validateUsername,
} from "@/lib/utils";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateUsername(
  formData: FormData,
): Promise<ProfileActionResult> {
  const member = await requireMember();
  const displayName = String(formData.get("displayName") ?? "").trim();

  const nameError = validateUsername(displayName);
  if (nameError) {
    return { ok: false, error: nameError };
  }

  if (displayName === member.display_name) {
    return { ok: false, error: "That’s already your username." };
  }

  if (isUsernameCooldownActive(member.display_name_changed_at)) {
    const ends = usernameCooldownEndsAt(member.display_name_changed_at);
    return {
      ok: false,
      error: ends
        ? `You can change your username again on ${formatCooldownDate(ends)}.`
        : "You can only change your username every 14 days.",
    };
  }

  const service = createServiceClient();
  const { data: nameTaken } = await service
    .from("members")
    .select("id")
    .ilike("display_name", displayName)
    .neq("id", member.id)
    .maybeSingle();

  if (nameTaken) {
    return { ok: false, error: "That username is already taken." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ display_name: displayName })
    .eq("id", member.id);

  if (error) {
    if (error.message.toLowerCase().includes("14 days")) {
      return {
        ok: false,
        error: "You can only change your username every 14 days.",
      };
    }
    if (error.code === "23505") {
      return { ok: false, error: "That username is already taken." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionForMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

export async function updateAvatar(
  formData: FormData,
): Promise<ProfileActionResult> {
  const member = await requireMember();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (!AVATAR_MIME.has(file.type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP, or GIF image." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "Image must be 2 MB or smaller." };
  }

  const ext = extensionForMime(file.type);
  if (!ext) {
    return { ok: false, error: "Unsupported image type." };
  }

  const supabase = await createClient();
  const path = `${member.id}/avatar.${ext}`;

  const { data: existing } = await supabase.storage.from("avatars").list(member.id);
  const orphans = (existing ?? [])
    .map((file) => file.name)
    .filter((name) => name !== `avatar.${ext}`)
    .map((name) => `${member.id}/${name}`);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  if (orphans.length > 0) {
    await supabase.storage.from("avatars").remove(orphans);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("members")
    .update({ avatar_url: avatarUrl })
    .eq("id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function removeAvatar(): Promise<ProfileActionResult> {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from("avatars")
    .list(member.id);

  if (files && files.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(files.map((file) => `${member.id}/${file.name}`));
  }

  const { error } = await supabase
    .from("members")
    .update({ avatar_url: null })
    .eq("id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}
