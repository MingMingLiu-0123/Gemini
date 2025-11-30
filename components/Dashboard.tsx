import React from 'react';
import { getStats, getTrades, saveTrade, deleteTrade } from '../services/storage';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, CheckCircle, XCircle, TrendingUp, Activity, Scale } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const stats = getStats();

  const loadData = () => {
    setTrades(getTrades());
  };

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const closeTrade = (trade: Trade, pnl: number) => {
    const updated = { ...trade, status: TradeStatus.CLOSED, pnl, exitPrice: 0 };
    saveTrade(updated);
    loadData();
  };
  
  const handleDelete = (id: string) => {
      if(confirm('确定要删除这条记录吗？')) {
          deleteTrade(id);
          loadData();
      }
  }

  const pnlData = trades
    .filter(t => t.status === TradeStatus.CLOSED)
    .slice(0, 20)
    .reverse()
    .map((t, i) => ({ name: i + 1, pnl: t.pnl }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="当前权益 (预估)" value={`¥${(18000 + stats.totalPnL).toFixed(0)}`} color="text-white" icon={<TrendingUp size={16} className="text-blue-400"/>} />
        <StatCard label="总盈亏" value={`¥${stats.totalPnL.toFixed(0)}`} color={stats.totalPnL >= 0 ? "text-trade-success" : "text-trade-danger"} />
        <StatCard label="胜率" value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate > 50 ? "text-trade-success" : "text-trade-warning"} />
        <StatCard label="交易次数" value={stats.totalTrades.toString()} color="text-slate-300" />
      </div>

      {/* Advanced Logic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col justify-between">
             <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Scale size={14} /> 盈亏因子 (Profit Factor)
                </div>
                <div className={`text-2xl font-bold ${stats.profitFactor > 1.5 ? 'text-trade-success' : stats.profitFactor > 1 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {stats.profitFactor.toFixed(2)}
                </div>
             </div>
             <p className="text-xs text-slate-500 mt-2">总盈利 / 总亏损。大于 1.5 为优秀系统。</p>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col justify-between">
             <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Activity size={14} /> 单笔期望值 (Expectancy)
                </div>
                <div className={`text-2xl font-bold ${stats.expectancy > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    ¥{stats.expectancy.toFixed(1)}
                </div>
             </div>
             <p className="text-xs text-slate-500 mt-2">长期来看，每做一笔交易预期的平均收益。</p>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col justify-between">
             <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">平均盈亏比 (Reward:Risk)</div>
                <div className="text-2xl font-bold text-white">
                    {stats.avgLoss > 0 ? `1 : ${(stats.avgWin / stats.avgLoss).toFixed(1)}` : "N/A"}
                </div>
             </div>
             <p className="text-xs text-slate-500 mt-2">平均赚一次顶亏几次。建议维持在 1:2 以上。</p>
          </div>
      </div>

      {/* Chart */}
      <div className="bg-trade-secondary p-6 rounded-lg border border-slate-700">
        <h3 className="text-white font-bold mb-4">资金曲线 (最近20笔)</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlData}>
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="pnl">
                        {pnlData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl && entry.pnl > 0 ? '#10b981' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Active Trades */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">持仓订单 <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{trades.filter(t => t.status === TradeStatus.OPEN).length}</span></h3>
        {trades.filter(t => t.status === TradeStatus.OPEN).map(trade => (
            <div key={trade.id} className="bg-slate-800 p-4 rounded-lg border border-l-4 border-slate-700 border-l-trade-accent flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${trade.direction === TradeDirection.LONG ? 'text-trade-success' : 'text-trade-danger'}`}>
                          {trade.direction === TradeDirection.LONG ? '做多' : '做空'}
                        </span>
                        <span className="font-mono text-white">{trade.asset}</span>
                        <span className="text-xs text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                        开仓: <span className="text-white">{trade.entryPrice}</span> | 止损: <span className="text-white">{trade.stopLossPrice}</span> | 手数: <span className="text-white">{trade.positionSize}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            const profit = Math.abs(trade.entryPrice - trade.stopLossPrice) * trade.contractMultiplier * trade.positionSize * 2; // Target 1:2 approx
                            closeTrade(trade, profit);
                        }}
                        className="bg-trade-success/10 hover:bg-trade-success/20 text-trade-success border border-trade-success/50 px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                        <CheckCircle size={14} /> 止盈离场
                    </button>
                    <button 
                         onClick={() => {
                            const loss = -Math.abs(trade.riskAmount);
                            closeTrade(trade, loss);
                        }}
                        className="bg-trade-danger/10 hover:bg-trade-danger/20 text-trade-danger border border-trade-danger/50 px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                        <XCircle size={14} /> 止损离场
                    </button>
                    <button onClick={() => handleDelete(trade.id)} className="text-slate-600 hover:text-slate-400 p-2"><Trash2 size={16}/></button>
                </div>
            </div>
        ))}
        {trades.filter(t => t.status === TradeStatus.OPEN).length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500">
                无持仓。耐心是金。
            </div>
        )}
      </div>

       {/* History */}
       <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">历史记录 (最近5笔)</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                    <tr>
                        <th className="px-4 py-3">日期</th>
                        <th className="px-4 py-3">品种</th>
                        <th className="px-4 py-3">信号</th>
                        <th className="px-4 py-3">R倍数</th>
                        <th className="px-4 py-3 text-right">盈亏</th>
                        <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.filter(t => t.status === TradeStatus.CLOSED).slice(0, 5).map(trade => {
                        const rMultiple = trade.pnl && trade.riskAmount ? (trade.pnl / trade.riskAmount).toFixed(1) : '0.0';
                        return (
                        <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="px-4 py-3">{new Date(trade.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-bold text-white">
                                <span className={trade.direction === TradeDirection.LONG ? 'text-green-500' : 'text-red-500'}>
                                  {trade.direction === TradeDirection.LONG ? '多' : '空'}
                                </span> {trade.asset}
                            </td>
                            <td className="px-4 py-3">{trade.entrySignal}</td>
                            <td className="px-4 py-3 font-mono">{rMultiple}R</td>
                            <td className={`px-4 py-3 text-right font-bold ${(trade.pnl || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(trade.pnl || 0) > 0 ? '+' : ''}{trade.pnl?.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => handleDelete(trade.id)} className="text-slate-600 hover:text-slate-400"><Trash2 size={14}/></button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
       </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: { label: string, value: string, color: string, icon?: React.ReactNode }) => (
    <div className="bg-trade-secondary p-4 rounded border border-slate-700">
        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center justify-between">
            {label}
            {icon}
        </div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
);

export default Dashboard;