export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }
  return "http://localhost:3000";
}

export function authEmailRedirectTo(): string {
  return `${getAppOrigin()}/auth/callback`;
}
