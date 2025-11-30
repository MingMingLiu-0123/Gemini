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

// 新增：复盘详情接口
export interface TradeReview {
  rating: number; // 1-10分 交易质量打分
  mood: string; // 交易时的心理状态 (如: 平静, 焦虑, 贪婪, 恐惧)
  tags: string[]; // 标签 (如: "追涨杀跌", "完美执行", "消息面干扰")
  chartUrl?: string; // TradingView 图表链接
  mistakes?: string; // 犯了什么错？
  improvements?: string; // 下次如何改进？
  isReviewed: boolean; // 是否已复盘
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
  
  // 复盘数据 (Optional)
  review?: TradeReview;
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