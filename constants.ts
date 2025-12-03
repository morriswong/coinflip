import { CoinSide, Currency } from './types';

export const APP_NAME = "CoinFlip";
export const DEFAULT_INSTRUCTION = "Ask a yes/no question, then tap the coin.";

// Colors for the coin gradient
export const COIN_GRADIENT_HEADS = "bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700";
export const COIN_GRADIENT_TAILS = "bg-gradient-to-bl from-gray-300 via-gray-400 to-gray-500"; // Silver coin for tails for contrast, or just reversed gold

export const GEMINI_MODEL_NAME = "gemini-2.5-flash";

// Currency definitions
export const CURRENCIES: Currency[] = [
  {
    id: 'gbp-penny',
    name: 'British Penny',
    displayName: 'GBP',
    headsImage: '/images/coins/gbp-penny-heads.svg',
    tailsImage: '/images/coins/gbp-penny-tails.svg',
    country: 'GB',
    denomination: '1 penny'
  },
  {
    id: 'usd-quarter',
    name: 'US Quarter',
    displayName: 'USD',
    headsImage: '/images/coins/usd-quarter-heads.svg',
    tailsImage: '/images/coins/usd-quarter-tails.svg',
    country: 'US',
    denomination: '25 cents'
  },
  {
    id: 'eur-euro',
    name: 'Euro Coin',
    displayName: 'EUR',
    headsImage: '/images/coins/eur-euro-heads.svg',
    tailsImage: '/images/coins/eur-euro-tails.svg',
    country: 'EU',
    denomination: '1 euro'
  },
  {
    id: 'jpy-yen',
    name: 'Japanese Yen',
    displayName: 'JPY',
    headsImage: '/images/coins/jpy-yen-heads.svg',
    tailsImage: '/images/coins/jpy-yen-tails.svg',
    country: 'JP',
    denomination: '100 yen'
  }
];

export const DEFAULT_CURRENCY_ID = 'gbp-penny';
