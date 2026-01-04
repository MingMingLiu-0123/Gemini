import React from 'react';
import { getStats, getTrades, saveTrade, deleteTrade } from '../services/storage';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, CheckCircle, XCircle, TrendingUp, Activity, Calendar, Lock, History } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const stats = getStats();

  const loadData = () => {
    setTrades(getTrades());
  };

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const closeTrade = (trade: Trade, pnl: number) => {
    const updated = { ...trade, status: TradeStatus.CLOSED, pnl, exitPrice: 0 };
    saveTrade(updated);
    loadData();
  };
  
  const handleDelete = (id: string) => {
      if(confirm('确定删除此记录？')) {
          deleteTrade(id);
          loadData();
      }
  }

  const today = new Date().toISOString().slice(0, 10);
  const dailyPnLMap: Record<string, number> = {};
  trades.filter(t => t.status === TradeStatus.CLOSED).forEach(t => {
      const dateKey = new Date(t.date).toISOString().slice(0, 10);
      dailyPnLMap[dateKey] = (dailyPnLMap[dateKey] || 0) + (t.pnl || 0);
  });

  const todayPnL = dailyPnLMap[today] || 0;
  const DAILY_LOSS_LIMIT = -720; 
  const isCircuitBreakerActive = todayPnL <= DAILY_LOSS_LIMIT;

  const pnlData = trades
    .filter(t => t.status === TradeStatus.CLOSED)
    .slice(0, 15)
    .reverse()
    .map((t, i) => ({ name: i + 1, pnl: t.pnl }));

  const calendarDays = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      {/* Risk Alert */}
      {isCircuitBreakerActive && (
          <div className="bg-red-500/10 border border-red-500 p-4 rounded-xl flex items-center gap-4 animate-pulse">
              <Lock className="text-red-500 shrink-0" size={24} />
              <div className="text-sm">
                  <h4 className="font-bold text-red-500">风控熔断已激活</h4>
                  <p className="text-red-300">今日亏损达 ¥{Math.abs(todayPnL)}，请立即停止交易。</p>
              </div>
          </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="当前权益" value={`¥${(18000 + stats.totalPnL).toFixed(0)}`} color="text-white" />
        <StatCard label="总盈亏" value={`${stats.totalPnL >= 0 ? '+' : ''}¥${stats.totalPnL.toFixed(0)}`} color={stats.totalPnL >= 0 ? "text-trade-success" : "text-trade-danger"} />
        <StatCard label="今日盈亏" value={`${todayPnL >= 0 ? '+' : ''}¥${todayPnL.toFixed(0)}`} color={todayPnL >= 0 ? "text-trade-success" : "text-trade-danger"} />
        <StatCard label="胜率" value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate >= 45 ? "text-trade-success" : "text-trade-warning"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar - Full on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 bg-trade-secondary p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Calendar size={16}/> 14日状态</h3>
              </div>
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                  {calendarDays.map(date => {
                      const val = dailyPnLMap[date];
                      const isToday = date === today;
                      return (
                          <div key={date} className={`h-12 md:h-16 rounded-lg border flex flex-col items-center justify-center ${val > 0 ? 'bg-green-500/10 border-green-500/30' : val < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800'} ${isToday ? 'ring-2 ring-trade-accent' : ''}`}>
                              <span className="text-[10px] text-slate-600 mb-0.5">{new Date(date).getDate()}</span>
                              {val !== undefined && <span className={`text-[10px] md:text-xs font-bold ${val > 0 ? 'text-green-500' : 'text-red-500'}`}>{val > 0 ? '+' : ''}{val.toFixed(0)}</span>}
                          </div>
                      );
                  })}
              </div>
          </div>

          <div className="bg-trade-secondary p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase">单笔期望</span>
                <Activity size={16} className="text-blue-500" />
              </div>
              <div className={`text-3xl font-bold ${stats.expectancy > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ¥{stats.expectancy.toFixed(1)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                   <div className="text-slate-500 mb-1 uppercase tracking-tight">盈亏因子</div>
                   <div className="text-white font-mono">{stats.profitFactor.toFixed(2)}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                   <div className="text-slate-500 mb-1 uppercase tracking-tight">盈亏比</div>
                   <div className="text-white font-mono">{stats.avgLoss > 0 ? `1:${(stats.avgWin / stats.avgLoss).toFixed(1)}` : '-'}</div>
                </div>
              </div>
          </div>
      </div>

      {/* Chart - Height optimized for mobile */}
      <div className="bg-trade-secondary p-4 md:p-6 rounded-xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 mb-4">资产表现曲线</h3>
        <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlData}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#475569'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#475569'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="pnl">
                        {pnlData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl && entry.pnl > 0 ? '#10b981' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Active Position List */}
      <div className="space-y-3 pb-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">当前持仓 ({trades.filter(t => t.status === TradeStatus.OPEN).length})</h3>
        {trades.filter(t => t.status === TradeStatus.OPEN).map(trade => (
            <div key={trade.id} className="bg-slate-800 p-4 rounded-xl border-l-4 border-l-trade-accent border border-slate-700 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction === TradeDirection.LONG ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {trade.direction === TradeDirection.LONG ? '多' : '空'}
                            </span>
                            <span className="font-bold text-white text-base">{trade.asset}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">开仓: {trade.entryPrice} | 止损: {trade.stopLossPrice}</div>
                    </div>
                    <button onClick={() => handleDelete(trade.id)} className="text-slate-600 p-1"><Trash2 size={16}/></button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => closeTrade(trade, 720)} className="flex-1 bg-trade-success/10 hover:bg-trade-success/20 text-trade-success border border-trade-success/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> 止盈
                    </button>
                    <button onClick={() => closeTrade(trade, -360)} className="flex-1 bg-trade-danger/10 hover:bg-trade-danger/20 text-trade-danger border border-trade-danger/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <XCircle size={14} /> 止损
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => (
    <div className="bg-trade-secondary p-4 rounded-xl border border-slate-800">
        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-lg md:text-xl font-bold truncate ${color}`}>{value}</div>
    </div>
);

export default Dashboard;