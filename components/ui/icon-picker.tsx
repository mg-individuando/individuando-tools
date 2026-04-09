"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface FreepikIcon {
  id: number;
  name: string;
  thumbnail: string;
  style: string;
  family: string;
}

interface IconPickerProps {
  value?: string; // current icon URL
  onSelect: (iconUrl: string, iconName: string) => void;
  onClose: () => void;
}

// Only use "lineal" (outline) style — same as sua_alma project
const FIXED_STYLE = "lineal";

export default function IconPicker({ value, onSelect, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("business");
  const [icons, setIcons] = useState<FreepikIcon[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setDebouncedSearch(search.trim());
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch icons
  useEffect(() => {
    async function fetchIcons() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          term: debouncedSearch,
          page: String(page),
          style: FIXED_STYLE,
        });

        const res = await fetch(`/api/icons/search?${params}`);
        const data = await res.json();

        if (data.icons) {
          setIcons(data.icons);
          setLastPage(data.lastPage || 1);
        }
      } catch {
        console.error("Failed to fetch icons");
      } finally {
        setLoading(false);
      }
    }

    fetchIcons();
  }, [debouncedSearch, page]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 font-sans">
              Ícones Freepik
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ícones... (ex: target, heart, chart)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-300 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Style badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-100 text-purple-700 font-medium">
              Outline
            </span>
            <span className="text-xs text-gray-400">Freepik Icons</span>
          </div>
        </div>

        {/* Icons grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : icons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">
                Nenhum ícone encontrado. Tente outro termo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => onSelect(icon.thumbnail, icon.name)}
                  className={`group relative aspect-square rounded-xl border-2 p-2 transition-all hover:scale-105 hover:shadow-md ${
                    value === icon.thumbnail
                      ? "border-purple-400 bg-purple-50 shadow-md"
                      : "border-transparent hover:border-gray-200 bg-gray-50/50 hover:bg-white"
                  }`}
                  title={icon.name}
                >
                  <img
                    src={icon.thumbnail}
                    alt={icon.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap pointer-events-none z-10">
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="px-5 py-3 border-t flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-gray-400">
              Página {page} de {Math.min(lastPage, 100)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
