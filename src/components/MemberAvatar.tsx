import { avatarColor, getInitials } from "@/lib/utils";

export function MemberAvatar({
  displayName,
  avatarUrl,
  size = "md",
  className = "",
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "lg" ? "h-20 w-20 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-xs";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`grid ${sizeClass} shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{ background: avatarColor(displayName) }}
    >
      {getInitials(displayName)}
    </span>
  );
}
