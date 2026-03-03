import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MultiSearchableSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  options: string[];
  disabled?: boolean;
  includeOther?: boolean;
}

const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select options',
  label,
  options,
  disabled = false,
  includeOther = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Always include "Other" if enabled, even if no matches found
  const allOptions = includeOther 
    ? [...filteredOptions, 'Other'] 
    : filteredOptions;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const toggleSelection = (option: string) => {
    if (value.includes(option)) {
      onValueChange(value.filter(v => v !== option));
    } else {
      onValueChange([...value, option]);
    }
  };

  const removeTag = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter(v => v !== option));
  };

  const displayValue = value.length > 0 
    ? `${value.length} selected`
    : placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="text-xs font-mono text-muted-foreground mb-1 block">{label}</label>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-mono rounded-md border bg-muted/50 border-border transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/30 cursor-pointer'
        } ${isOpen ? 'border-primary/50 bg-muted' : ''}`}
      >
        <span className={value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue}
        </span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map(v => (
            <div
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded text-xs font-mono"
            >
              {v === 'Other' ? 'Other (Custom)' : v}
              <button
                onClick={(e) => removeTag(v, e)}
                className="hover:text-primary ml-1"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-border bg-card rounded-md shadow-lg z-50 animate-fade-in">
          {/* Search Input */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-7 pr-7 h-7 text-xs bg-background border-border font-mono focus:border-primary/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {allOptions.length > 0 ? (
              allOptions.map((option, idx) => {
                const isOther = option === 'Other';
                const isSelected = value.includes(option);

                return (
                  <button
                    key={`${option}-${idx}`}
                    onClick={() => toggleSelection(option)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors flex items-center gap-2 ${
                      isSelected
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-foreground'
                    } ${isOther ? 'border-t border-border pt-2' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3 h-3 cursor-pointer"
                    />
                    {isOther ? '✶ Other (Custom Category)' : option}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSearchableSelect;
