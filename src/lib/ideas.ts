import { createClient } from "@/lib/supabase/server";
import type {
  CommentData,
  IdeaCardData,
  Member,
  VoteValue,
} from "@/lib/types";

type MemberLite = Pick<Member, "id" | "display_name">;

export async function fetchBoardData(currentMemberId: string): Promise<{
  ideas: IdeaCardData[];
  commentsByIdea: Record<string, CommentData[]>;
}> {
  const supabase = await createClient();

  const [
    { data: ideas, error: ideasError },
    { data: members, error: membersError },
    { data: votes, error: votesError },
    { data: comments, error: commentsError },
  ] = await Promise.all([
    supabase
      .from("ideas")
      .select("id, author_id, title, description, category, decision, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("members").select("id, display_name"),
    supabase.from("votes").select("id, idea_id, member_id, value"),
    supabase
      .from("comments")
      .select("id, idea_id, author_id, body, created_at, updated_at")
      .order("created_at", { ascending: true }),
  ]);

  if (ideasError) {
    throw new Error(ideasError.message);
  }
  if (membersError) {
    throw new Error(membersError.message);
  }
  if (votesError) {
    throw new Error(votesError.message);
  }
  if (commentsError) {
    throw new Error(commentsError.message);
  }

  const memberMap = new Map<string, MemberLite>(
    (members ?? []).map((m) => [m.id, m]),
  );

  const voteMapByIdea = new Map<string, { member_id: string; value: VoteValue }[]>();
  for (const vote of votes ?? []) {
    const list = voteMapByIdea.get(vote.idea_id) ?? [];
    list.push({
      member_id: vote.member_id,
      value: vote.value as VoteValue,
    });
    voteMapByIdea.set(vote.idea_id, list);
  }

  const ideaCards: IdeaCardData[] = (ideas ?? []).map((idea) => {
    const ideaVotes = voteMapByIdea.get(idea.id) ?? [];
    const executeCount = ideaVotes.filter((v) => v.value === "execute").length;
    const holdCount = ideaVotes.filter((v) => v.value === "hold").length;
    const myVote =
      ideaVotes.find((v) => v.member_id === currentMemberId)?.value ?? null;
    const author = memberMap.get(idea.author_id);
    const commentCount = (comments ?? []).filter(
      (c) => c.idea_id === idea.id,
    ).length;

    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      category: idea.category,
      decision: idea.decision,
      createdAt: idea.created_at,
      author: {
        id: idea.author_id,
        displayName: author?.display_name ?? "Unknown",
      },
      executeCount,
      holdCount,
      commentCount,
      myVote,
    };
  });

  const commentsByIdea: Record<string, CommentData[]> = {};
  for (const row of comments ?? []) {
    const list = commentsByIdea[row.idea_id] ?? [];
    list.push({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        id: row.author_id,
        displayName: memberMap.get(row.author_id)?.display_name ?? "Unknown",
      },
      vote:
        (voteMapByIdea.get(row.idea_id) ?? []).find(
          (v) => v.member_id === row.author_id,
        )?.value ?? null,
    });
    commentsByIdea[row.idea_id] = list;
  }

  return { ideas: ideaCards, commentsByIdea };
}
