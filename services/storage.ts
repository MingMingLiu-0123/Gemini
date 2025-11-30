import { Trade, TradeStatus } from '../types';

const STORAGE_KEY = 'tradelogic_trades_v1';

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTrade = (trade: Trade): void => {
  const trades = getTrades();
  const existingIndex = trades.findIndex(t => t.id === trade.id);
  
  if (existingIndex >= 0) {
    trades[existingIndex] = trade;
  } else {
    trades.unshift(trade);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const deleteTrade = (id: string): void => {
  const trades = getTrades().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const getStats = () => {
  const trades = getTrades().filter(t => t.status === TradeStatus.CLOSED);
  const totalTrades = trades.length;
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  const losses = trades.filter(t => (t.pnl || 0) <= 0).length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  return {
    totalTrades,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    totalPnL,
    wins,
    losses
  };
};