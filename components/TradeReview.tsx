import React, { useState, useEffect } from 'react';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { getTrades, saveTrade } from '../services/storage';
import { CheckCircle, XCircle, AlertTriangle, Save, ExternalLink, Star, Tag, Brain, TrendingUp, Trophy } from 'lucide-react';

const TradeReview: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PLAYBOOK'>('ALL'); // NEW: Filter
  
  // Form State
  const [rating, setRating] = useState(0);
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [improvements, setImprovements] = useState('');

  const MOOD_OPTIONS = ['平静', '焦虑', '贪婪', '恐惧', '过度自信', '犹豫'];
  const COMMON_TAGS = ['完美执行', '止损过窄', '追涨', '摸顶', '错过入场', '提前离场', '持仓过夜'];

  useEffect(() => {
    loadTrades();
  }, [filterMode]);

  useEffect(() => {
    if (selectedTrade) {
      const r = selectedTrade.review || {};
      setRating(r.rating || 0);
      setMood(r.mood || '');
      setTags(r.tags || []);
      setChartUrl(r.chartUrl || '');
      setMistakes(r.mistakes || '');
      setImprovements(r.improvements || '');
    }
  }, [selectedTrade]);

  const loadTrades = () => {
    let allTrades = getTrades().filter(t => t.status === TradeStatus.CLOSED);
    
    // Playbook Logic: Only trades with review rating >= 8
    if (filterMode === 'PLAYBOOK') {
        allTrades = allTrades.filter(t => (t.review?.rating || 0) >= 8);
    }

    setTrades(allTrades);
    // Reset selection if current selection is filtered out
    if (selectedTrade && !allTrades.find(t => t.id === selectedTrade.id)) {
        setSelectedTrade(null);
    }
  };

  const handleSave = () => {
    if (!selectedTrade) return;

    const updatedTrade: Trade = {
      ...selectedTrade,
      review: {
        isReviewed: true,
        rating,
        mood,
        tags,
        chartUrl,
        mistakes,
        improvements
      }
    };

    saveTrade(updatedTrade);
    loadTrades(); // Refresh list
    setSelectedTrade(updatedTrade); // Update current view
    alert('复盘记录已保存！');
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 animate-fadeIn">
      {/* Left List */}
      <div className="w-full md:w-1/3 bg-trade-secondary rounded-lg border border-slate-700 overflow-hidden flex flex-col">
        {/* Filter Tabs */}
        <div className="flex border-b border-slate-700">
            <button 
                onClick={() => setFilterMode('ALL')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${filterMode === 'ALL' ? 'bg-slate-800 text-white border-b-2 border-trade-accent' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <TrendingUp size={16} /> 待复盘列表
            </button>
            <button 
                onClick={() => setFilterMode('PLAYBOOK')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${filterMode === 'PLAYBOOK' ? 'bg-slate-800 text-yellow-400 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-yellow-200 hover:bg-slate-800'}`}
            >
                <Trophy size={16} /> 教科书 (8分+)
            </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {trades.length === 0 && (
            <div className="text-slate-500 text-center p-4 text-sm flex flex-col items-center">
                {filterMode === 'PLAYBOOK' ? (
                    <>
                        <Trophy size={32} className="mb-2 opacity-20" />
                        <p>暂无“教科书级”交易。</p>
                        <p className="text-xs mt-1">努力执行，获得8分以上评价即可入选。</p>
                    </>
                ) : (
                    '暂无已平仓交易'
                )}
            </div>
          )}
          {trades.map(trade => (
            <div 
              key={trade.id}
              onClick={() => setSelectedTrade(trade)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-700 ${selectedTrade?.id === trade.id ? 'bg-slate-700 border-trade-accent' : 'bg-slate-800 border-slate-700'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-sm ${trade.direction === TradeDirection.LONG ? 'text-green-400' : 'text-red-400'}`}>
                   {trade.direction === TradeDirection.LONG ? '多' : '空'} {trade.asset}
                </span>
                <span className="text-xs text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className={`font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(trade.pnl || 0) > 0 ? '+' : ''}{trade.pnl?.toFixed(0)}
                 </div>
                 {trade.review?.isReviewed ? (
                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${(trade.review.rating || 0) >= 8 ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600/50' : 'bg-green-900/50 text-green-400'}`}>
                        {(trade.review.rating || 0) >= 8 ? <Star size={10} fill="currentColor" /> : <CheckCircle size={10} />}
                        {(trade.review.rating || 0) >= 8 ? `${trade.review.rating}分` : '已复盘'}
                    </span>
                 ) : (
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">未复盘</span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Editor */}
      <div className="flex-1 bg-trade-secondary rounded-lg border border-slate-700 overflow-y-auto">
        {!selectedTrade ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Brain size={48} className="mb-4 opacity-50" />
            <p>请从左侧选择一笔交易开始复盘</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
             {/* Header Info */}
             <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {selectedTrade.asset} {selectedTrade.direction === TradeDirection.LONG ? '做多' : '做空'}复盘
                    </h2>
                    <div className="text-sm text-slate-400 flex gap-4">
                        <span>开仓: {selectedTrade.entryPrice}</span>
                        <span>止损: {selectedTrade.stopLossPrice}</span>
                        <span>风险: ¥{selectedTrade.riskAmount.toFixed(0)}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">最终盈亏</div>
                    <div className={`text-3xl font-bold ${(selectedTrade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(selectedTrade.pnl || 0) > 0 ? '+' : ''}{selectedTrade.pnl}
                    </div>
                </div>
             </div>

             {/* Rating Section */}
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                <label className="block text-sm font-bold text-white mb-3">这笔交易你打几分？(1-10)</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                            key={num}
                            onClick={() => setRating(num)}
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${rating >= num ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                            {num}
                        </button>
                    ))}
                    <div className="ml-4 text-sm text-slate-400">
                        {rating >= 8 ? '🌟 优秀的一单！(入选教科书)' : rating >= 5 ? '👌 中规中矩' : rating > 0 ? '⚠️ 需要反思' : ''}
                    </div>
                </div>
             </div>

             {/* Psychology & Tags */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><Brain size={16}/> 当时心理状态</label>
                    <div className="flex flex-wrap gap-2">
                        {MOOD_OPTIONS.map(m => (
                            <button 
                                key={m}
                                onClick={() => setMood(m)}
                                className={`px-3 py-1 rounded-full text-xs border ${mood === m ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><Tag size={16}/> 交易标签</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                         {COMMON_TAGS.map(t => (
                            <button 
                                key={t}
                                onClick={() => toggleTag(t)}
                                className={`px-3 py-1 rounded text-xs border ${tags.includes(t) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            placeholder="自定义标签..."
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white flex-1"
                            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                        />
                        <button onClick={addCustomTag} className="bg-slate-700 px-2 py-1 rounded text-xs hover:bg-slate-600 text-white">+</button>
                    </div>
                </div>
             </div>

             {/* Analysis Text Areas */}
             <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-bold text-white mb-2">💡 我做错了什么？ / 哪里可以做得更好？</label>
                    <textarea 
                        className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-3 text-sm text-white focus:border-trade-accent outline-none"
                        placeholder="例如：没等K线收盘就进场了；止损移动太快被洗出..."
                        value={mistakes}
                        onChange={e => setMistakes(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-bold text-white mb-2">🚀 下次改进计划</label>
                    <textarea 
                        className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-3 text-sm text-white focus:border-trade-accent outline-none"
                        placeholder="例如：严格等待5分钟收盘；必须看到2个共振因子..."
                        value={improvements}
                        onChange={e => setImprovements(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-bold text-white mb-2">📊 图表链接 (TradingView/Gyazo URL)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chartUrl}
                            onChange={e => setChartUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-trade-accent outline-none"
                        />
                        {chartUrl && (
                             <a href={chartUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-700 rounded text-white hover:bg-slate-600">
                                <ExternalLink size={18} />
                             </a>
                        )}
                    </div>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="pt-6 border-t border-slate-700 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-trade-success hover:bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow-lg flex items-center gap-2"
                >
                    <Save size={18} /> 保存复盘记录
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeReview;