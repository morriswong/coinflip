# Implementation Plan: Multi-Currency Real Coin Images

## Overview
Expand the CoinFlip PWA to display realistic photographs of actual currency coins instead of gradient backgrounds. Start with British Penny (1p coin), with architecture to easily add more currencies later. Add a pill-shaped toggle button in the header for currency selection.

## User Requirements
- Toggle/pill-shaped button at top to choose between currencies
- Realistic images/photos of actual coins (not gradients)
- Start with British Pound (1 penny coin)
- **Remove all text overlays** - show pure coin images
- Maintain existing 3D flip animation
- Need to source/find coin images

## Key Design Decisions

### 1. Data Structure
- New `Currency` interface with image paths, names, and metadata
- Centralized `CURRENCIES` array in constants.ts for easy extensibility
- Update `HistoryItem` to optionally track which currency was used

### 2. Image Implementation
- **Use `<img>` elements** (better loading control than CSS backgrounds)
- **Remove text overlays** (H/T letters, taglines) when images loaded
- **Keep text as fallback** only when images fail to load (gradient fallback)
- Preload images on mount and currency change to prevent flicker
- Image specs: 1024×1024px JPEG, ~100-150KB, centered composition

### 3. UI Design
- Currency selector: horizontal pill in header center
- Active state: gold background (matches theme)
- Disabled during flip animation
- Header layout: title (left) | currency selector (center) | history button (right)

---

## Critical Files to Modify

### 1. `types.ts` - Add Currency type
**Lines to add after line 4 (after CoinSide enum):**
```typescript
export interface Currency {
  id: string;                    // e.g., "gbp-penny"
  name: string;                  // e.g., "British Penny"
  displayName: string;           // e.g., "UK 1p"
  headsImage: string;            // Path: /images/coins/gbp-penny-heads.jpg
  tailsImage: string;            // Path: /images/coins/gbp-penny-tails.jpg
  country: string;               // ISO code: "GB"
  denomination: string;          // "1 penny"
}
```

**Line 9 - Update HistoryItem:**
Add optional `currencyId?: string;` field

---

### 2. `constants.ts` - Currency registry
**Add after line 8:**
```typescript
import { Currency } from './types';

export const CURRENCIES: Currency[] = [
  {
    id: 'gbp-penny',
    name: 'British Penny',
    displayName: 'UK 1p',
    headsImage: '/images/coins/gbp-penny-heads.jpg',
    tailsImage: '/images/coins/gbp-penny-tails.jpg',
    country: 'GB',
    denomination: '1 penny'
  }
];

export const DEFAULT_CURRENCY_ID = 'gbp-penny';
```

Keep existing gradient constants for fallback purposes.

---

### 3. `components/CurrencySelector.tsx` - NEW FILE
Create pill-shaped toggle component for currency selection.

**Implementation:**
```typescript
import React from 'react';
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
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur rounded-full p-1.5">
      {currencies.map((currency) => (
        <button
          key={currency.id}
          onClick={() => onSelectCurrency(currency.id)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${selectedCurrencyId === currency.id
              ? 'bg-gold-500 text-slate-900 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {currency.displayName}
        </button>
      ))}
    </div>
  );
};
```

---

### 4. `components/Coin3D.tsx` - Replace gradients with images

**Line 5-9 - Update props interface:**
```typescript
interface Coin3DProps {
  result: CoinSide;
  isFlipping: boolean;
  onFlipStart: () => void;
  currency: Currency;           // NEW
}
```

**Line 11 - Update component signature:**
```typescript
export const Coin3D: React.FC<Coin3DProps> = ({ result, isFlipping, onFlipStart, currency }) => {
```

**Line 14 - Add image loading states:**
```typescript
const [imagesLoaded, setImagesLoaded] = useState(false);
const [imageError, setImageError] = useState(false);
```

**After line 41 - Add image preloading effect:**
```typescript
// Preload images when currency changes
useEffect(() => {
  setImagesLoaded(false);
  setImageError(false);

  const headsImg = new Image();
  const tailsImg = new Image();
  let headsLoaded = false;
  let tailsLoaded = false;

  const checkBothLoaded = () => {
    if (headsLoaded && tailsLoaded) {
      setImagesLoaded(true);
    }
  };

  headsImg.onload = () => {
    headsLoaded = true;
    checkBothLoaded();
  };

  tailsImg.onload = () => {
    tailsLoaded = true;
    checkBothLoaded();
  };

  headsImg.onerror = () => setImageError(true);
  tailsImg.onerror = () => setImageError(true);

  headsImg.src = currency.headsImage;
  tailsImg.src = currency.tailsImage;
}, [currency]);
```

**Lines 53-61 - Replace HEADS face (remove text overlays):**
```typescript
<div className={`absolute w-full h-full rounded-full backface-hidden shadow-[0_0_50px_rgba(234,179,8,0.4)] border-4 border-yellow-600 flex items-center justify-center overflow-hidden ${imageError || !imagesLoaded ? COIN_GRADIENT_HEADS : 'bg-slate-900'}`}>
  {imagesLoaded && !imageError ? (
    <>
      <img
        src={currency.headsImage}
        alt={`${currency.name} heads`}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {/* Shine effect overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
    </>
  ) : (
    // Fallback to gradient with text
    <div className="w-[90%] h-[90%] rounded-full border-2 border-yellow-600/50 flex flex-col items-center justify-center p-4 border-dashed">
      <span className="text-6xl font-black text-yellow-900 drop-shadow-md">H</span>
      <span className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-800 mt-2">Heads</span>
    </div>
  )}
</div>
```

**Lines 64-75 - Replace TAILS face (remove text overlays):**
```typescript
<div
  className={`absolute w-full h-full rounded-full backface-hidden shadow-[0_0_50px_rgba(148,163,184,0.4)] border-4 border-slate-600 flex items-center justify-center overflow-hidden ${imageError || !imagesLoaded ? 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500' : 'bg-slate-900'}`}
  style={{ transform: 'rotateX(180deg)' }}
>
  {imagesLoaded && !imageError ? (
    <>
      <img
        src={currency.tailsImage}
        alt={`${currency.name} tails`}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {/* Shine effect overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
    </>
  ) : (
    // Fallback to gradient with text
    <div className="w-[90%] h-[90%] rounded-full border-2 border-slate-600/50 flex flex-col items-center justify-center p-4 border-dashed">
      <span className="text-6xl font-black text-slate-800 drop-shadow-md">T</span>
      <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-700 mt-2">Tails</span>
    </div>
  )}
</div>
```

**Note:** Remove the unused audioRef (line 14) if not needed.

---

### 5. `App.tsx` - Integrate currency selection

**Lines 1-4 - Add imports:**
```typescript
import { CurrencySelector } from './components/CurrencySelector';
import { CURRENCIES, DEFAULT_CURRENCY_ID } from './constants';
import { Currency } from './types';
```

**After line 11 - Add currency state:**
```typescript
const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>(DEFAULT_CURRENCY_ID);
const selectedCurrency = CURRENCIES.find(c => c.id === selectedCurrencyId) || CURRENCIES[0];
```

**Lines 39-43 - Update handleFlip to track currency:**
```typescript
const newItem: HistoryItem = {
  id: Date.now().toString(),
  side: newSide,
  timestamp: Date.now(),
  currencyId: selectedCurrencyId,  // NEW
};
```

**Lines 54-70 - Update header layout:**
Replace header section with:
```typescript
<header className="p-6 flex justify-between items-center relative z-10">
  <div>
    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-700">
      CoinFlip
    </h1>
    <p className="text-xs text-slate-400">PWA Edition</p>
  </div>

  {/* Currency Selector - centered */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <CurrencySelector
      currencies={CURRENCIES}
      selectedCurrencyId={selectedCurrencyId}
      onSelectCurrency={setSelectedCurrencyId}
      disabled={isFlipping}
    />
  </div>

  <button
    onClick={() => setShowHistory(!showHistory)}
    className="p-2 rounded-full bg-slate-800/50 backdrop-blur hover:bg-slate-700 transition-colors"
    aria-label="History"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
</header>
```

**Lines 77-81 - Update Coin3D props:**
```typescript
<Coin3D
  result={result}
  isFlipping={isFlipping}
  onFlipStart={handleFlip}
  currency={selectedCurrency}  // NEW
/>
```

**Lines 120-127 - Update history display to show currency:**
```typescript
<div className="flex items-baseline space-x-2">
  <span className={`font-bold ${item.side === CoinSide.HEADS ? 'text-gold-400' : 'text-slate-300'}`}>
    {item.side}
  </span>
  {item.currencyId && (
    <span className="text-xs text-slate-500">
      ({CURRENCIES.find(c => c.id === item.currencyId)?.displayName || 'Unknown'})
    </span>
  )}
  <span className="text-xs text-slate-500">
    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </span>
</div>
```

---

## Image Asset Requirements

### Directory Structure
Create: `public/images/coins/`

Files needed:
- `gbp-penny-heads.jpg` (heads/obverse side)
- `gbp-penny-tails.jpg` (tails/reverse side)

### Image Specifications
- **Format:** JPEG (better compression for photos)
- **Dimensions:** 1024×1024px (square, will be clipped to circle)
- **File size:** 100-150KB each (optimized)
- **Composition:** Coin perfectly centered in frame
- **Background:** White or transparent
- **Quality:** Professional coin photography with even lighting

### Sourcing Images

**Option 1: Free Stock Photos**
- Search on Unsplash or Pexels
- Keywords: "british penny coin", "1p coin UK", "penny isolated white background"
- Look for high-resolution, well-lit, centered shots
- Verify commercial use license

**Option 2: Royal Mint Resources**
- Check royalmint.com for official images
- May require attribution or permission

**Option 3: Custom Photography**
- Photograph real penny with smartphone macro mode
- Use even lighting (natural light or lightbox)
- White background paper
- Edit to center and crop to square

**Image Processing:**
1. Crop to 1:1 aspect ratio (square)
2. Resize to 1024×1024px
3. Center coin in frame
4. Optimize with ImageOptim or TinyPNG (target 100-150KB)
5. Save as JPEG at 80-85% quality

---

## Implementation Sequence

### Step 1: Foundation (types & constants)
1. Update `types.ts` - add Currency interface, update HistoryItem
2. Update `constants.ts` - add CURRENCIES array
3. **No visual changes yet**

### Step 2: Currency Selector Component
4. Create `components/CurrencySelector.tsx`
5. **Self-contained, can be tested in isolation**

### Step 3: Acquire Images
6. Source British Penny coin images (heads + tails)
7. Process and optimize images
8. Place in `public/images/coins/` directory

### Step 4: Update Coin3D
9. Modify `components/Coin3D.tsx` with image loading logic
10. Replace gradient faces with img elements
11. Remove text overlays when images loaded
12. **Core visual change**

### Step 5: App Integration
13. Update `App.tsx` with currency state and selector
14. Wire up all props
15. Update history display

### Step 6: Testing
16. Test image loading and fallback states
17. Test 3D animation smoothness with images
18. Test on mobile devices
19. Test offline PWA functionality with cached images

---

## Edge Cases Handled

- **Images fail to load:** Fallback to gradient backgrounds with H/T text
- **Currency switching during flip:** Selector disabled while isFlipping=true
- **History with removed currency:** Shows "Unknown" if currency not in array
- **Browser caching:** Images auto-cached; preloading ensures smooth UX
- **Circular clipping:** overflow-hidden + rounded-full clips square images

---

## Future Extensibility

To add new currencies later:
1. Acquire and process coin images for new currency
2. Add entry to CURRENCIES array in constants.ts
3. **No other code changes needed** - fully data-driven

Example:
```typescript
{
  id: 'usd-quarter',
  name: 'US Quarter',
  displayName: 'US 25¢',
  headsImage: '/images/coins/usd-quarter-heads.jpg',
  tailsImage: '/images/coins/usd-quarter-tails.jpg',
  country: 'US',
  denomination: '25 cents'
}
```

---

## Summary

This plan maintains the mystical theme and 3D animation while replacing abstract gradients with authentic coin photography. The architecture is extensible (easy to add currencies), robust (fallback states), and performant (image preloading). The implementation is split into clear phases with minimal risk of breaking existing functionality.
