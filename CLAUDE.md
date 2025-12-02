# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CoinFlip** is a React-based PWA (Progressive Web App) that features a 3D animated coin flip experience. The app generates random heads/tails outcomes, maintains flip history, and is designed with a mystical theme powered by Tailwind CSS and custom 3D animations.

## Stack & Build

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (CDN-loaded in index.html)
- **PWA**: vite-plugin-pwa for offline support and app manifest
- **Runtime**: Node.js

### Common Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

**Note**: No tests are currently configured. The build and dev commands are the primary ways to validate changes.

## Architecture

### Core Components & Files

**App.tsx** (root component)
- Manages global state: `result` (current coin side), `isFlipping` (animation state), `history` (flip records), `showHistory` (overlay visibility)
- Handles coin flip logic via `handleFlip()`: randomizes result, triggers 3D animation, records to history
- Layout: header with history toggle, centered coin component, and bottom sheet history overlay
- Uses haptic feedback (vibration) on flip start and landing

**Coin3D.tsx** (components/Coin3D.tsx)
- 3D animated coin with two faces (HEADS/TAILS) using CSS 3D transforms
- Rotation calculation: determines spins (5-10 full rotations) plus adjustment to land on the correct face
- Implements `backface-hidden` for realistic 3D flip effect
- Visual: gold gradient for heads, slate gradient for tails
- Shadow effect scales with animation

**types.ts**
- `CoinSide` enum: HEADS, TAILS
- `HistoryItem`: tracks id, side, timestamp (with unused fields: question, aiResponse for future AI integration)
- `OracleState`: placeholder types for potential future AI oracle functionality

**constants.ts**
- `COIN_GRADIENT_HEADS`: gold color gradient
- `COIN_GRADIENT_TAILS`: slate color gradient
- `GEMINI_MODEL_NAME`: references gemini-2.5-flash (currently unused in codebase)

**index.html**
- Loads Tailwind CSS from CDN with custom theme extensions (gold color palette, bounce-slight animation)
- Configures PWA meta tags for iOS compatibility and installability
- Defines CSS utilities for 3D transforms (perspective-1000, transform-style-3d, backface-hidden)
- Custom scrollbar styling for history overlay

### Key Design Patterns

**State Management**
- Uses React hooks (useState) for local component state
- No global state manager; all state flows through App.tsx

**Animation Timing**
- Coin flip animation: 3 seconds (matches CSS `duration-[3000ms]`)
- Rotation calculation: spins + face-specific offset to ensure correct landing orientation
- Haptic feedback on start and completion

**PWA Configuration**
- Auto-update service worker registration
- App manifest defines icons, theme colors, and app metadata
- Currently configured but may need icon assets in public/ directory

### Data Flow

1. User taps coin → `handleFlip()` called
2. Random result determined (`Math.random() > 0.5`)
3. `isFlipping` state triggers Coin3D animation
4. Coin3D calculates rotation based on target face
5. After 3s timeout, animation ends and HistoryItem added to state
6. History displayed in bottom sheet overlay

## Environment & Secrets

- **GEMINI_API_KEY**: Referenced in vite.config.ts via loadEnv(), should be set in `.env.local`
- Not currently used in the application code (future feature)

## Deployment to Cloudflare Pages

This PWA is deployed to Cloudflare Pages using the wrangler CLI.

### First-Time Setup

1. **Install wrangler** (if not already installed globally):
   ```bash
   npm install -D wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create wrangler.toml** in the project root (recommended configuration):
   ```toml
   name = "coinflip"
   compatibility_date = "2025-11-22"
   pages_build_output_dir = "dist"

   [env.production]
   name = "coinflip"
   ```

### Deployment Commands

**Option 1: Using wrangler.toml (recommended)**
```bash
npm run build
wrangler pages deploy dist
```

**Option 2: Without wrangler.toml (direct deployment)**
```bash
npm run build
wrangler pages deploy dist --project-name=coinflip
```

### Build Process

Before deploying, the project must be built:
```bash
npm run build
```

This generates the `dist/` directory containing:
- Bundled React app (index.html and assets/)
- PWA manifest (manifest.webmanifest)
- Service worker files (sw.js, registerSW.js)
- PWA icons (pwa-192x192.png, pwa-512x512.png, maskable-icon.png)

### Important Notes

- **No environment variables required** for deployment: GEMINI_API_KEY is referenced in the code but not currently used
- **PWA features work out-of-the-box**: Service workers and offline support are automatically configured via vite-plugin-pwa
- **Static site**: The app is a static PWA; Cloudflare Pages handles all hosting and caching
- **Build output directory**: Ensure `pages_build_output_dir = "dist"` in wrangler.toml matches the Vite output

### Cloudflare Pages Dashboard

Once deployed, you can manage the app at:
- https://dash.cloudflare.com/
- Navigate to Pages → coinflip project
- Configure custom domains, environment variables (if needed in future), and view deployment history

## Notable Implementation Details

- History IDs currently use `Date.now().toString()` instead of the imported uuid library
- Rotation state persists across flips (new rotations add to previous)
- No error boundaries or error handling for user interactions
- Mobile-optimized: viewport meta tag disables zoom, uses `touch-action: manipulation`
- CSS uses both Tailwind classes and inline styles (for dynamic transforms)
