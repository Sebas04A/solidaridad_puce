
import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface ComboboxOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  onSearch?: (query: string) => void;
  options: ComboboxOption[];
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  onCreate?: (query: string) => void;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  value,
  onChange,
  onSearch,
  options,
  isLoading,
  placeholder = "Select option...",
  label,
  error,
  onCreate,
  emptyText = "No results found.",
  className
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setQuery("");
  };

  const handleCreate = () => {
    if (onCreate && query) {
      onCreate(query);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg cursor-pointer bg-white transition-all",
          "hover:border-gray-400 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent",
          error ? "border-red-500" : "border-gray-300",
          isOpen && "ring-2 ring-primary-500 border-transparent"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center px-2 py-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400"
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            {isLoading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />}
          </div>
          
          <div className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 && !isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                <p>{emptyText}</p>
                {onCreate && query && (
                  <button
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate();
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Create "{query}"
                  </button>
                )}
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                    option.value === value && "bg-primary-50 text-primary-700 font-medium"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                >
                  <Check 
                    className={cn(
                      "w-4 h-4 mr-2 text-primary-600",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )} 
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
