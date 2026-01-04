import React, { useState, useEffect } from 'react';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { getTrades, saveTrade } from '../services/storage';
import { CheckCircle, XCircle, Save, Star, Tag, Brain, TrendingUp, Trophy, ArrowLeft } from 'lucide-react';

const TradeReview: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PLAYBOOK'>('ALL');
  const [showDetail, setShowDetail] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(0);
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [improvements, setImprovements] = useState('');

  useEffect(() => {
    loadTrades();
  }, [filterMode]);

  useEffect(() => {
    if (selectedTrade) {
      setRating(selectedTrade.review?.rating || 0);
      setMood(selectedTrade.review?.mood || '');
      setTags(selectedTrade.review?.tags || []);
      setMistakes(selectedTrade.review?.mistakes || '');
      setImprovements(selectedTrade.review?.improvements || '');
      setShowDetail(true);
    } else {
      setShowDetail(false);
    }
  }, [selectedTrade]);

  const loadTrades = () => {
    let allTrades = getTrades().filter(t => t.status === TradeStatus.CLOSED);
    if (filterMode === 'PLAYBOOK') {
        allTrades = allTrades.filter(t => (t.review?.rating || 0) >= 8);
    }
    setTrades(allTrades);
  };

  const handleSave = () => {
    if (!selectedTrade) return;
    const updatedTrade: Trade = {
      ...selectedTrade,
      review: {
        isReviewed: true, rating, mood, tags, mistakes, improvements
      }
    };
    saveTrade(updatedTrade);
    loadTrades();
    setSelectedTrade(updatedTrade);
    alert('已保存复盘');
    if (window.innerWidth < 768) setShowDetail(false);
  };

  return (
    <div className="flex h-full gap-4 relative">
      {/* List Panel - Hidden on mobile when showing detail */}
      <div className={`w-full md:w-1/3 flex flex-col bg-trade-secondary rounded-xl border border-slate-800 overflow-hidden ${showDetail ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex border-b border-slate-800">
            <button onClick={() => setFilterMode('ALL')} className={`flex-1 py-3 text-xs font-bold transition-all ${filterMode === 'ALL' ? 'text-trade-accent border-b-2 border-trade-accent bg-slate-800' : 'text-slate-500'}`}>待复盘</button>
            <button onClick={() => setFilterMode('PLAYBOOK')} className={`flex-1 py-3 text-xs font-bold transition-all ${filterMode === 'PLAYBOOK' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-slate-800' : 'text-slate-500'}`}>教科书</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {trades.map(trade => (
            <div key={trade.id} onClick={() => setSelectedTrade(trade)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTrade?.id === trade.id ? 'bg-slate-700 border-trade-accent ring-1 ring-trade-accent' : 'bg-slate-800 border-slate-800 hover:bg-slate-750'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-sm ${trade.direction === TradeDirection.LONG ? 'text-green-400' : 'text-red-400'}`}>{trade.asset}</span>
                <span className="text-[10px] text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className={`font-mono text-sm font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(trade.pnl || 0) > 0 ? '+' : ''}{trade.pnl}</div>
                 {trade.review?.isReviewed && <span className="text-[10px] bg-slate-900 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1"><Star size={10} fill="currentColor" /> {trade.review.rating}</span>}
              </div>
            </div>
          ))}
          {trades.length === 0 && <div className="text-center py-20 text-slate-500 text-sm">暂无数据</div>}
        </div>
      </div>

      {/* Editor Panel - Full screen on mobile */}
      <div className={`flex-1 bg-trade-secondary rounded-xl border border-slate-800 overflow-y-auto ${showDetail ? 'flex flex-col' : 'hidden md:flex flex-col items-center justify-center'}`}>
        {!selectedTrade ? (
          <div className="text-slate-500 text-center p-8"><Brain size={48} className="mx-auto mb-4 opacity-20" /><p>选择一笔交易开始分析</p></div>
        ) : (
          <div className="p-4 md:p-6 space-y-6">
             <div className="flex items-center gap-3 mb-4 md:hidden">
                <button onClick={() => setShowDetail(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400"><ArrowLeft size={20}/></button>
                <h3 className="text-lg font-bold">交易详情</h3>
             </div>

             <div className="bg-slate-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setRating(n)} className={`w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center text-xs font-bold ${rating >= n ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{n}</button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 italic">给你的执行打个分，而不是盈亏。</div>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">心理状态</label>
                  <div className="flex flex-wrap gap-2">
                    {['平静', '焦虑', '贪婪', '恐惧', '犹豫'].map(m => (
                      <button key={m} onClick={() => setMood(m)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${mood === m ? 'bg-trade-accent border-trade-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{m}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">我的错误 / 改进空间</label>
                    <textarea value={mistakes} onChange={e => setMistakes(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-trade-accent outline-none" placeholder="记录当时的犹豫或冲动..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">下一次计划</label>
                    <textarea value={improvements} onChange={e => setImprovements(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-trade-accent outline-none" placeholder="下次如何做到知行合一？"></textarea>
                  </div>
                </div>
             </div>

             <div className="pt-4 flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-trade-success hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"><Save size={18} /> 保存复盘</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeReview;