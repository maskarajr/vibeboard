import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string; detail?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }

  return (
    <LoginForm
      initialError={
        params.error === "auth"
          ? "That sign-in link is invalid or expired. Request a new one."
          : undefined
      }
      detail={params.detail}
    />
  );
}
