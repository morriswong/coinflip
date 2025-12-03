export enum CoinSide {
  HEADS = 'HEADS',
  TAILS = 'TAILS'
}

export interface Currency {
  id: string;
  name: string;
  displayName: string;
  headsImage: string;
  tailsImage: string;
  country: string;
  denomination: string;
}

export interface HistoryItem {
  id: string;
  side: CoinSide;
  timestamp: number;
  currencyId?: string;
  question?: string;
  aiResponse?: string;
}

export interface OracleState {
  isActive: boolean;
  question: string;
  loading: boolean;
  response: string | null;
}