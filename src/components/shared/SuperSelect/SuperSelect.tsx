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
      <div className="relative w-full">{children}</div>
    </Context.Provider>
  );
};

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className={`w-5 h-5 min-w-[20px] min-h-[20px] block flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-gold-base' : 'text-slate-400'}`}
    fill="none" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

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
    <div className="relative flex items-center justify-between w-full gap-2 px-4 py-2 bg-brand-light/50 border border-brand-border rounded-lg group has-[:focus-visible]:border-brand-gold-base has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-brand-gold-base/30 transition-all duration-200 shadow-sm text-slate-100">
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
        className={`w-full flex-1 bg-transparent border-none focus:outline-none placeholder-slate-500 truncate ${className}`}
        aria-expanded={isOpen}
        aria-controls="super-select-list"
        aria-autocomplete="list"
      />
      <div className="pointer-events-none flex-shrink-0 flex items-center justify-center transition-colors group-hover:text-brand-gold-base/70">
        <ChevronIcon isOpen={isOpen} />
      </div>
    </div>
  );
};

SuperSelect.List = function List({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isOpen } = useSuperSelect();
  if (!isOpen) return null;

  return (
    <div
      id="super-select-list"
      role="listbox"
      className={`absolute left-0 right-0 z-50 mt-2 animate-dropdown glassmorphism rounded-xl overflow-hidden ${className}`}
    >
      <div className="max-h-60 overflow-y-auto py-2 px-1 custom-scrollbar">
        {children}
      </div>
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
      className={`px-3 py-2.5 mx-1 my-0.5 rounded-lg cursor-pointer transition-all border-l-4 ${
        isSelected ? 'border-brand-gold-base bg-brand-gold-base/5' : 'border-transparent'
      } ${
        isActive ? 'bg-brand-light/80 text-brand-gold-hover' : 'text-slate-300 hover:bg-brand-light/40 hover:text-white'
      } ${className}`}
    >
      {typeof children === 'function' ? children({ active: isActive, selected: isSelected }) : children}
    </div>
  );
};
