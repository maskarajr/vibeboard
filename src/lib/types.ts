export type VoteValue = "execute" | "hold";
export type DecisionValue = VoteValue;
export type BoardFilter = "all" | "execute-leading" | "hold-leading" | "decided";

export type Member = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
};

export type IdeaRow = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: string;
  decision: DecisionValue | null;
  created_at: string;
};

export type VoteRow = {
  id: string;
  idea_id: string;
  member_id: string;
  value: VoteValue;
  created_at: string;
};

export type CommentRow = {
  id: string;
  idea_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type IdeaCardData = {
  id: string;
  title: string;
  description: string;
  category: string;
  decision: DecisionValue | null;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
  executeCount: number;
  holdCount: number;
  commentCount: number;
  myVote: VoteValue | null;
};

export type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
  vote: VoteValue | null;
};
