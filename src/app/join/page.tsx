import { JoinForm } from "@/components/JoinForm";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <JoinForm initialError={params.error} />;
}
