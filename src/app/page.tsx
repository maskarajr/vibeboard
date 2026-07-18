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
      displayName={member.display_name}
      ideas={ideas}
      commentsByIdea={commentsByIdea}
    />
  );
}
