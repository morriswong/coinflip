import React, { useRef, useEffect } from 'react';
import { Currency } from '../types';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrencyId: string;
  onSelectCurrency: (currencyId: string) => void;
  disabled?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrencyId,
  onSelectCurrency,
  disabled = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view when selection changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeTab = activeTabRef.current;

      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      // Check if tab is outside visible area
      const isOutOfView =
        tabRect.left < containerRect.left ||
        tabRect.right > containerRect.right;

      if (isOutOfView) {
        // Scroll to center the active tab
        const scrollLeft =
          activeTab.offsetLeft -
          container.offsetWidth / 2 +
          activeTab.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedCurrencyId]);

  return (
    <div className="relative w-full">
      {/* Left fade indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />

      {/* Scrollable tabs container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-6 overflow-x-auto scroll-smooth px-6 py-4 no-scrollbar"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE/Edge
        }}
      >
        {currencies.map((currency) => {
          const isActive = selectedCurrencyId === currency.id;

          return (
            <button
              key={currency.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => !disabled && onSelectCurrency(currency.id)}
              disabled={disabled}
              className={`
                relative flex-shrink-0 px-1 py-2 text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'text-gold-400'
                  : 'text-slate-400 hover:text-slate-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {currency.displayName}

              {/* Animated underline indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full"
                  style={{
                    animation: 'slideIn 0.3s ease-out'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right fade indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
    </div>
  );
};
