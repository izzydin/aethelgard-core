import { createContext, useContext, useState, useEffect } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

type SuperSelectContextType = {
  value: any;
  onChange: (val: any) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  focusedValue: any;
  setFocusedValue: (val: any) => void;
  registerOption: (opt: { value: any; label: string }) => void;
  unregisterOption: (value: any) => void;
  visibleOptions: { value: any; label: string }[];
};

const Context = createContext<SuperSelectContextType | null>(null);

export const useSuperSelect = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Must be used inside SuperSelect');
  return ctx;
};

export const SuperSelect = ({ value, onChange, children }: { value: any; onChange: (val: any) => void; children: ReactNode }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedValue, setFocusedValue] = useState<any>(null);
  const [options, setOptions] = useState<{ value: any; label: string }[]>([]);

  const registerOption = (opt: { value: any; label: string }) => {
    setOptions((prev) => {
      if (prev.some((p) => p.value === opt.value)) return prev;
      return [...prev, opt];
    });
  };

  const unregisterOption = (val: any) => {
    setOptions((prev) => prev.filter((p) => p.value !== val));
  };

  const visibleOptions = options.filter((o) =>
    o.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Context.Provider
      value={{
        value,
        onChange,
        inputValue,
        setInputValue,
        isOpen,
        setIsOpen,
        focusedValue,
        setFocusedValue,
        registerOption,
        unregisterOption,
        visibleOptions,
      }}
    >
      <div className="relative w-full max-w-sm">{children}</div>
    </Context.Provider>
  );
};

SuperSelect.Input = function Input({ placeholder = '', className = '' }: { placeholder?: string; className?: string }) {
  const { inputValue, setInputValue, isOpen, setIsOpen, visibleOptions, focusedValue, setFocusedValue, onChange } = useSuperSelect();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      if (visibleOptions.length > 0) {
        const idx = visibleOptions.findIndex((o) => o.value === focusedValue);
        const nextIdx = (idx + 1) % visibleOptions.length;
        setFocusedValue(visibleOptions[nextIdx].value);
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      if (visibleOptions.length > 0) {
        const idx = visibleOptions.findIndex((o) => o.value === focusedValue);
        const nextIdx = idx <= 0 ? visibleOptions.length - 1 : idx - 1;
        setFocusedValue(visibleOptions[nextIdx].value);
      }
    }
    if (e.key === 'Enter' && isOpen && focusedValue) {
      e.preventDefault();
      onChange(focusedValue);
      setIsOpen(false);
      setInputValue('');
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        setIsOpen(true);
        setFocusedValue(null);
      }}
      onFocus={() => setIsOpen(true)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-gold bg-brand-slate text-white ${className}`}
      aria-expanded={isOpen}
      aria-controls="super-select-list"
      aria-autocomplete="list"
    />
  );
};

SuperSelect.List = function List({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isOpen } = useSuperSelect();
  if (!isOpen) return null;

  return (
    <div
      id="super-select-list"
      role="listbox"
      className={`absolute z-10 w-full mt-1 bg-brand-slate border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
};

type OptionRenderProps = { active: boolean; selected: boolean };

SuperSelect.Option = function Option({
  value,
  label,
  children,
  className = '',
}: {
  value: any;
  label: string;
  children: ((props: OptionRenderProps) => ReactNode) | ReactNode;
  className?: string;
}) {
  const {
    registerOption,
    unregisterOption,
    visibleOptions,
    focusedValue,
    setFocusedValue,
    value: selectedValue,
    onChange,
    setIsOpen,
    setInputValue,
  } = useSuperSelect();

  useEffect(() => {
    registerOption({ value, label });
    return () => unregisterOption(value);
  }, [value, label]);

  const isVisible = visibleOptions.some((o) => o.value === value);
  if (!isVisible) return null;

  const isSelected = selectedValue === value;
  const isActive = focusedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        onChange(value);
        setIsOpen(false);
        setInputValue(''); // Reset input value after selection
      }}
      onMouseEnter={() => setFocusedValue(value)}
      className={`px-4 py-2 cursor-pointer transition-colors ${
        isActive ? 'bg-gray-800 text-brand-gold' : 'text-gray-200'
      } ${className}`}
    >
      {typeof children === 'function' ? children({ active: isActive, selected: isSelected }) : children}
    </div>
  );
};
