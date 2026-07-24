import { redirect } from "next/navigation";

import { BoardClient } from "@/components/BoardClient";
import { getCurrentMember } from "@/lib/auth";
import { fetchBoardData } from "@/lib/ideas";

export default async function HomePage() {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/login");
  }

  const { ideas, commentsByIdea } = await fetchBoardData(member.id);

  return (
    <BoardClient
      currentMemberId={member.id}
      displayName={member.display_name}
      avatarUrl={member.avatar_url}
      ideas={ideas}
      commentsByIdea={commentsByIdea}
    />
  );
}
