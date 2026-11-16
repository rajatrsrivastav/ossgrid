import Link from "next/link";
import Image from "next/image";
import type { CommunityMember } from "@/lib/community-types";

interface MemberCardProps {
  member: CommunityMember;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <Link
      href={`/community/members/${member.slug}`}
      className="card group flex flex-col p-5 transition-colors duration-200 hover:bg-[var(--bg-card-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex items-center gap-3">
        {member.avatarUrl ? (
          <Image
            src={member.avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-[var(--radius-control)] bg-[var(--bg-input)] object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--bg-input)] text-sm font-semibold text-[var(--text-secondary)]"
          >
            {member.name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[var(--text-primary)]">{member.name}</p>
          {member.github && (
            <p className="num truncate text-xs text-[var(--text-muted)]">@{member.github}</p>
          )}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{member.bio}</p>
      {member.skills.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {member.skills.slice(0, 3).map((skill) => (
            <li key={skill} className="chip num text-xs">
              {skill}
            </li>
          ))}
          {member.skills.length > 3 && (
            <li className="chip num text-xs">+{member.skills.length - 3}</li>
          )}
        </ul>
      )}
    </Link>
  );
}
