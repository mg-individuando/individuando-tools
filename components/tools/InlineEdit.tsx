"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  tag?: "h3" | "p" | "span" | "label";
}

/**
 * Inline click-to-edit text component for builder mode.
 * Renders static text that becomes an input on click.
 */
export default function InlineEdit({
  value,
  onChange,
  className = "",
  style,
  placeholder = "Clique para editar",
  multiline = false,
  tag: Tag = "span",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  }

  if (editing) {
    const props = {
      ref: ref as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKeyDown,
      className: `w-full bg-white/90 border border-[#0080ff]/40 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#0080ff]/20 focus:border-[#0080ff] transition-all ${className}`,
      style,
      placeholder,
    };

    return multiline
      ? <textarea {...props} rows={2} />
      : <input type="text" {...props} />;
  }

  return (
    <Tag
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditing(true); }}
      className={`cursor-text rounded px-1 -mx-1 transition-all hover:bg-[#0080ff]/[0.06] hover:ring-1 hover:ring-[#0080ff]/20 group/inline ${className}`}
      style={style}
      title="Clique para editar"
    >
      {value || <span className="opacity-40 italic">{placeholder}</span>}
      <Pencil className="w-3 h-3 text-[#0080ff]/30 inline ml-1 opacity-0 group-hover/inline:opacity-100 transition-opacity" />
    </Tag>
  );
}
