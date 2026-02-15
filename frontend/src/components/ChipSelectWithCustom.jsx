import { useState, useMemo } from 'react';

/**
 * Searchable multi-select with chips and "add your own" input.
 * @param {string} label - Field label
 * @param {string[]} options - Predefined options
 * @param {string[]} value - Currently selected items
 * @param {(selected: string[]) => void} onChange - Called when selection changes
 * @param {string} searchPlaceholder - Placeholder for filter input
 * @param {string} addPlaceholder - Placeholder for "add your own" input
 * @param {string} [helpText] - Optional help text below the list
 * @param {string} [chipSelected] - Optional Tailwind/chip class when selected
 * @param {string} [chipUnselected] - Optional chip class when unselected
 */
export default function ChipSelectWithCustom({
  label,
  options,
  value,
  onChange,
  searchPlaceholder = 'Search...',
  addPlaceholder = 'Add your own (e.g. CS 999)',
  helpText,
  chipBase = 'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 cursor-pointer',
  chipSelected = 'border-coral-500 bg-coral-500/15 text-coral-600 border-[var(--coral-600)]',
  chipUnselected = 'border-[var(--cream-300)] bg-[var(--cream-100)] hover:border-[var(--cream-700)]',
}) {
  const [filter, setFilter] = useState('');
  const [customInput, setCustomInput] = useState('');

  const filteredOptions = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, filter]);

  const customOnly = useMemo(() => value.filter((v) => !options.includes(v)), [value, options]);

  const toggle = (item) => {
    if (value.includes(item)) {
      onChange(value.filter((i) => i !== item));
    } else {
      onChange([...value, item]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed)) {
      setCustomInput('');
      return;
    }
    onChange([...value, trimmed]);
    setCustomInput('');
  };

  return (
    <div>
      <label className="block font-dm-sans text-sm font-medium mb-2" style={{ color: 'var(--cream-900)' }}>
        {label}
      </label>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full px-4 py-2 rounded-lg border-2 mb-3 input-theme text-sm"
        aria-label={`Filter ${label}`}
      />

      <div
        className="flex flex-wrap gap-2 overflow-y-auto mb-3"
        style={{ maxHeight: '220px', minHeight: '80px' }}
      >
        {filteredOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`${chipBase} ${value.includes(opt) ? chipSelected : chipUnselected}`}
            style={value.includes(opt) ? {} : { color: 'var(--cream-800)' }}
          >
            {opt}
          </button>
        ))}
        {customOnly.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`${chipBase} ${chipSelected}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder={addPlaceholder}
          className="flex-1 min-w-[160px] px-4 py-2 rounded-lg border-2 input-theme text-sm"
          aria-label={`Add custom ${label}`}
        />
        <button
          type="button"
          onClick={addCustom}
          className="btn-secondary-warm text-sm py-2 px-4 shrink-0"
        >
          Add
        </button>
      </div>

      {helpText && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--cream-700)' }}>{helpText}</p>
      )}
    </div>
  );
}
