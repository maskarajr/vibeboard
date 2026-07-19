"use server";

import { revalidatePath } from "next/cache";

import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { VoteValue } from "@/lib/types";
import { isVoteValue, normalizeCategory } from "@/lib/utils";

export type IdeaActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createIdea(formData: FormData): Promise<IdeaActionResult> {
  const member = await requireMember();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = normalizeCategory(String(formData.get("category") ?? ""));

  if (!title || !description) {
    return { ok: false, error: "Title and description are required." };
  }
  if (!category) {
    return { ok: false, error: "Add a category for this idea." };
  }
  if (category.length > 40) {
    return { ok: false, error: "Category must be 40 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ideas").insert({
    author_id: member.id,
    title,
    description,
    category,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function castVote(
  ideaId: string,
  value: VoteValue,
): Promise<IdeaActionResult> {
  const member = await requireMember();
  if (!isVoteValue(value)) {
    return { ok: false, error: "Invalid vote." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("votes").upsert(
    {
      idea_id: ideaId,
      member_id: member.id,
      value,
    },
    { onConflict: "idea_id,member_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function setDecision(
  ideaId: string,
  decision: VoteValue,
): Promise<IdeaActionResult> {
  const member = await requireMember();
  if (!isVoteValue(decision)) {
    return { ok: false, error: "Invalid decision." };
  }

  const supabase = await createClient();
  const { data: idea, error: lookupError } = await supabase
    .from("ideas")
    .select("author_id")
    .eq("id", ideaId)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }
  if (!idea || idea.author_id !== member.id) {
    return {
      ok: false,
      error: "Only the author can make the final decision.",
    };
  }

  const { error } = await supabase
    .from("ideas")
    .update({ decision })
    .eq("id", ideaId)
    .eq("author_id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteIdea(ideaId: string): Promise<IdeaActionResult> {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: idea, error: lookupError } = await supabase
    .from("ideas")
    .select("author_id")
    .eq("id", ideaId)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }
  if (!idea || idea.author_id !== member.id) {
    return { ok: false, error: "Only the author can delete this idea." };
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", ideaId)
    .eq("author_id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function addComment(formData: FormData): Promise<IdeaActionResult> {
  const member = await requireMember();
  const ideaId = String(formData.get("ideaId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const voteRaw = String(formData.get("vote") ?? "");

  if (!ideaId || !body) {
    return { ok: false, error: "Comment cannot be empty." };
  }

  const supabase = await createClient();

  if (voteRaw && isVoteValue(voteRaw)) {
    const { error: voteError } = await supabase.from("votes").upsert(
      {
        idea_id: ideaId,
        member_id: member.id,
        value: voteRaw,
      },
      { onConflict: "idea_id,member_id" },
    );
    if (voteError) {
      return { ok: false, error: voteError.message };
    }
  }

  const { error } = await supabase.from("comments").insert({
    idea_id: ideaId,
    author_id: member.id,
    body,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updateComment(
  commentId: string,
  body: string,
): Promise<IdeaActionResult> {
  const member = await requireMember();
  const trimmed = body.trim();

  if (!commentId || !trimmed) {
    return { ok: false, error: "Comment cannot be empty." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Comment must be 2000 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .update({
      body: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .eq("author_id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
): Promise<IdeaActionResult> {
  const member = await requireMember();

  if (!commentId) {
    return { ok: false, error: "Comment not found." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", member.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
