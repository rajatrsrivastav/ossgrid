// OSSGrid logo mark: three grid squares and an outward arrow.

"use client";

interface LogoMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function LogoMark({ size = 20, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Grid squares */}
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.75" fill="currentColor" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />

      {/* Arrow in the top-right cell */}
      <path
        d="M14 4.5H19.5V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 12.5L19 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

