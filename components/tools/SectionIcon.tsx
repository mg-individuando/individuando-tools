"use client";

/**
 * Renders a section icon — either a URL image (Freepik) or falls back to nothing.
 * Used across all tool renderers to display section.icon consistently.
 */
interface SectionIconProps {
  icon?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionIcon({ icon, size = 20, className = "", style }: SectionIconProps) {
  if (!icon) return null;

  // If it's a URL (Freepik icon, uploaded image, etc.)
  if (icon.startsWith("http") || icon.startsWith("data:")) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-contain ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  // For non-URL strings, render nothing (legacy lucide names no longer supported in renderers)
  return null;
}
