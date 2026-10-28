import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Choose an option',
  searchPlaceholder = 'Search options…',
  required = false,
  disabled = false,
  onSearchChange,
  loading = false,
}) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const selected = options.find((option) => option.value === value);
  const matches = onSearchChange
    ? options
    : options.filter((option) =>
        `${option.label} ${option.detail || ''}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      );
  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [active, open, id]);
  useEffect(() => {
    const outside = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);
  function show() {
    setQuery('');
    onSearchChange?.('');
    setActive(0);
    setOpen(true);
  }
  function choose(option) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  }
  function keys(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((index) =>
        matches.length
          ? (index + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) %
            matches.length
          : 0
      );
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[active]) choose(matches[active]);
    }
    if (e.key === 'Tab') setOpen(false);
  }
  return (
    <div className="searchable-select" ref={root}>
      <label htmlFor={`${id}-trigger`}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        className="admin-input searchable-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-required={required}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            show();
          }
        }}
      >
        <span className={selected ? '' : 'is-placeholder'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="searchable-select-menu">
          <div className="searchable-select-search">
            <Search size={16} />
            <input
              ref={search}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-label={`Search ${label.toLowerCase()}`}
              aria-controls={`${id}-options`}
              aria-expanded="true"
              aria-activedescendant={
                matches[active] ? `${id}-option-${active}` : undefined
              }
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearchChange?.(e.target.value);
                setActive(0);
              }}
              onKeyDown={keys}
            />
          </div>
          <div
            role="listbox"
            id={`${id}-options`}
            aria-label={label}
            className="searchable-select-options"
          >
            {matches.map((option, index) => (
              <button
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                disabled={option.disabled}
                type="button"
                className={active === index ? 'is-active' : ''}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(option)}
              >
                <span>
                  {option.label}
                  {option.detail && <small>{option.detail}</small>}
                </span>
                {option.value === value && <Check size={15} />}
              </button>
            ))}
            {!matches.length && (
              <p role="status">
                {loading ? 'Searching…' : 'No matching options'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
