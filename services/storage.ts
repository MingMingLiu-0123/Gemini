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

export const importTrades = (trades: Trade[]): void => {
  if (Array.isArray(trades)) {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }
};

export const clearAllTrades = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getStats = () => {
  const trades = getTrades().filter(t => t.status === TradeStatus.CLOSED);
  const totalTrades = trades.length;
  
  const wins = trades.filter(t => (t.pnl || 0) > 0);
  const losses = trades.filter(t => (t.pnl || 0) <= 0);
  
  const winCount = wins.length;
  const lossCount = losses.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  // Advanced Stats
  const avgWin = winCount > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / winCount : 0;
  const avgLoss = lossCount > 0 ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / lossCount) : 0;
  
  // Profit Factor (Total Gross Profit / Total Gross Loss)
  const totalGrossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalGrossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : totalGrossProfit > 0 ? 999 : 0;

  // Expectancy (WinRate * AvgWin) - (LossRate * AvgLoss)
  // Reflects the average amount you expect to make (or lose) per trade
  const lossRate = totalTrades > 0 ? (lossCount / totalTrades) : 0;
  const winRateDecimal = totalTrades > 0 ? (winCount / totalTrades) : 0;
  const expectancy = (winRateDecimal * avgWin) - (lossRate * avgLoss);

  return {
    totalTrades,
    winRate,
    totalPnL,
    wins: winCount,
    losses: lossCount,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy
  };
};