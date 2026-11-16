import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './FilterSelect.css';

/**
 * A pill-shaped filter dropdown with a styled option panel, used instead of
 * the browser's native <select>. Works with mouse and keyboard
 * (arrows, Home/End, Enter/Space, Escape, typing a letter to jump).
 *
 * options: [{ value, label }]
 * defaultValue: the "no filter" value; when the current value differs, the pill is highlighted.
 */
export default function FilterSelect({ icon: Icon, label, value, options, onChange, defaultValue }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];
  const isFiltered = defaultValue !== undefined && value !== defaultValue;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => { setActiveIndex(selectedIndex); setOpen(true); };

  const choose = (index) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    const last = options.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(last, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); setActiveIndex(last); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(activeIndex); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); }
    else if (e.key.length === 1) {
      const ch = e.key.toLowerCase();
      const from = activeIndex + 1;
      const order = [...options.slice(from), ...options.slice(0, from)];
      const hit = order.find((o) => String(o.label).toLowerCase().startsWith(ch));
      if (hit) setActiveIndex(options.indexOf(hit));
    }
  };

  return (
    <div className={`fsel ${open ? 'is-open' : ''} ${isFiltered ? 'is-filtered' : ''}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="fsel-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label ? `${label}: ${selected?.label ?? ''}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {Icon ? <Icon size={13} aria-hidden="true" /> : null}
        <span className="fsel-value">{selected?.label}</span>
        <ChevronDown size={13} className="fsel-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="fsel-panel">
          {label ? <div className="fsel-panel-label">{label}</div> : null}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${listId}-${activeIndex}`}
            className="fsel-list"
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={`${option.value}`}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  className={`fsel-option ${index === activeIndex ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(index)}
                >
                  <span>{option.label}</span>
                  {isSelected ? <Check size={14} aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
