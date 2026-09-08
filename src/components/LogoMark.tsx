// OSSGrid Architectural Vector Mark — Precision Coordinate Matrix
// Monochromatic vector geometry engineered for crisp rendering at all DPI scales

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
      {/* Precision Grid Matrix Quadrants */}
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.75" fill="currentColor" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />

      {/* Trajectory / Open Source Launch Vector (Top-Right Quadrant) */}
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

