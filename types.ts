export enum CoinSide {
  HEADS = 'HEADS',
  TAILS = 'TAILS'
}

export interface HistoryItem {
  id: string;
  side: CoinSide;
  timestamp: number;
  question?: string;
  aiResponse?: string;
}

export interface OracleState {
  isActive: boolean;
  question: string;
  loading: boolean;
  response: string | null;
}