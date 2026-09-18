/** Inline SVG icons (Lucide geometry). No emoji: they render differently per OS. */
type IconProps = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
};

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CalendarIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  );
}

export function CameraIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M4 8h2.5l1.5-2h8l1.5 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function PlayIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M8 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

export function PlusIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M14 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M10 6l6 6-6 6" />
    </svg>
  );
}

export function XIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
