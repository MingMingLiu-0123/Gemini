import React from 'react';
import { getStats, getTrades, saveTrade, deleteTrade } from '../services/storage';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, Edit3, CheckCircle, XCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const stats = getStats();

  const loadData = () => {
    setTrades(getTrades());
  };

  React.useEffect(() => {
    loadData();
    // Poll for changes in case multiple tabs or Wizard updates
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const closeTrade = (trade: Trade, pnl: number) => {
    const updated = { ...trade, status: TradeStatus.CLOSED, pnl, exitPrice: 0 }; // Exit price simplified here
    saveTrade(updated);
    loadData();
  };
  
  const handleDelete = (id: string) => {
      if(confirm('Delete this record?')) {
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Capital (Est)" value={`¥${(18000 + stats.totalPnL).toFixed(0)}`} color="text-white" />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate > 50 ? "text-trade-success" : "text-trade-warning"} />
        <StatCard label="Total P&L" value={`¥${stats.totalPnL}`} color={stats.totalPnL >= 0 ? "text-trade-success" : "text-trade-danger"} />
        <StatCard label="Trades" value={stats.totalTrades.toString()} color="text-slate-300" />
      </div>

      {/* Chart */}
      <div className="bg-trade-secondary p-6 rounded-lg border border-slate-700">
        <h3 className="text-white font-bold mb-4">Performance Curve (Last 20)</h3>
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
        <h3 className="text-xl font-bold text-white flex items-center gap-2">Active Trades <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{trades.filter(t => t.status === TradeStatus.OPEN).length}</span></h3>
        {trades.filter(t => t.status === TradeStatus.OPEN).map(trade => (
            <div key={trade.id} className="bg-slate-800 p-4 rounded-lg border border-l-4 border-slate-700 border-l-trade-accent flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${trade.direction === TradeDirection.LONG ? 'text-trade-success' : 'text-trade-danger'}`}>{trade.direction}</span>
                        <span className="font-mono text-white">{trade.asset}</span>
                        <span className="text-xs text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                        Entry: <span className="text-white">{trade.entryPrice}</span> | SL: <span className="text-white">{trade.stopLossPrice}</span> | Lots: <span className="text-white">{trade.positionSize}</span>
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
                        <CheckCircle size={14} /> TP Hit
                    </button>
                    <button 
                         onClick={() => {
                            const loss = -Math.abs(trade.riskAmount);
                            closeTrade(trade, loss);
                        }}
                        className="bg-trade-danger/10 hover:bg-trade-danger/20 text-trade-danger border border-trade-danger/50 px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                        <XCircle size={14} /> SL Hit
                    </button>
                    <button onClick={() => handleDelete(trade.id)} className="text-slate-600 hover:text-slate-400 p-2"><Trash2 size={16}/></button>
                </div>
            </div>
        ))}
        {trades.filter(t => t.status === TradeStatus.OPEN).length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500">
                No active positions. Good patience.
            </div>
        )}
      </div>

       {/* History */}
       <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">History (Last 5)</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Asset</th>
                        <th className="px-4 py-3">Signal</th>
                        <th className="px-4 py-3">Risk</th>
                        <th className="px-4 py-3 text-right">P&L</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.filter(t => t.status === TradeStatus.CLOSED).slice(0, 5).map(trade => (
                        <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="px-4 py-3">{new Date(trade.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-bold text-white">
                                <span className={trade.direction === TradeDirection.LONG ? 'text-green-500' : 'text-red-500'}>{trade.direction[0]}</span> {trade.asset}
                            </td>
                            <td className="px-4 py-3">{trade.entrySignal}</td>
                            <td className="px-4 py-3">¥{trade.riskAmount.toFixed(0)}</td>
                            <td className={`px-4 py-3 text-right font-bold ${(trade.pnl || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(trade.pnl || 0) > 0 ? '+' : ''}{trade.pnl?.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => handleDelete(trade.id)} className="text-slate-600 hover:text-slate-400"><Trash2 size={14}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
       </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="bg-trade-secondary p-4 rounded border border-slate-700">
        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
);

export default Dashboard;