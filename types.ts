export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TradeStatus {
  PLANNING = 'PLANNING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export interface Trade {
  id: string;
  date: string;
  asset: string;
  direction: TradeDirection;
  
  // Step 1: D1
  d1ConditionsMet: boolean;
  
  // Step 2: H1
  h1ZoneType: string[]; // 'Support', 'MA60', 'Trendline'
  
  // Step 3: Confirmation
  entrySignal: string; // 'Pinbar', 'Engulfing', 'W-Bottom'
  
  // Step 4: 5m Trigger
  triggerType: string; // 'Box Breakout', 'Trendline Break', 'N-Pattern'
  
  // Risk & Position
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskAmount: number; // Should be ~360
  contractMultiplier: number; // e.g., 10 for Rebar
  positionSize: number; // Lots
  
  // Outcome
  status: TradeStatus;
  exitPrice?: number;
  pnl?: number;
  notes?: string;
  lessons?: string; // For the "Daily Review" section
}

export interface SystemSettings {
  totalCapital: number;
  riskPerTradePercent: number;
  maxRiskAmount: number;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  totalCapital: 18000,
  riskPerTradePercent: 0.02,
  maxRiskAmount: 360
};