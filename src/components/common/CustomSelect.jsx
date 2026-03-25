import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  optionClassName = '',
  itemPadding = '',
  showSelectedHeader = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate fixed position when opening
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 260;

      if (openUpward) {
        setDropdownStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 6,
          left: rect.left,
          minWidth: rect.width,
          zIndex: 20,
        });
      } else {
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          minWidth: rect.width,
          zIndex: 20,
        });
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Reposition if window resizes or scrolls while open
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownStyle((prev) => ({
          ...prev,
          top: rect.bottom + 6,
          left: rect.left,
          minWidth: rect.width,
        }));
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Normalize options - handle both string arrays and object arrays
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between rounded-lg px-4 py-1.5 text-sm focus:border-[#2563EB] focus:outline-none cursor-pointer gap-2 ${
          value ? "bg-[#EFF6FF] border border-[#1B84FF33]" : "bg-white border border-gray-300"
        } ${buttonClassName}`}
      >
        <span
          className={`${
            value ? 'text-[#1F6FEB] font-medium' : 'text-gray-400'
          } whitespace-nowrap truncate`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={`w-max rounded-xl border border-[#E5E7EB] bg-white shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {showSelectedHeader && selectedOption && (
            <div className="flex items-center justify-between px-4 py-2 bg-[#EBF2FD] text-[#2563EB] font-semibold border-b border-[#E5E7EB]">
              <span className="whitespace-nowrap">{selectedOption.label}</span>
              <ChevronDown className="h-4 w-4 text-[#2563EB]" />
            </div>
          )}
          <div className={optionClassName || "p-2"}>
            {normalizedOptions.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between ${itemPadding || (optionClassName ? 'px-3 py-2' : 'px-4 py-3')} rounded-lg text-sm transition-colors cursor-pointer mb-1 last:mb-0 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border border-[#1B84FF33] text-[#2563EB] font-semibold'
                      : 'text-[#111827] hover:bg-[#F9FAFB] border border-transparent'
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#1F6FEB] flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
