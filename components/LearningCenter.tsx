import React, { useState, useMemo, useEffect } from 'react';
import { TradeDirection } from '../types';
import { TrendingUp, BookOpen, Microscope, Layers, BrainCircuit, Zap, EyeOff } from 'lucide-react';
import CaseChart from './CaseChart';

const LearningCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'TREND' | 'REVERSAL' | 'TRAP'>('TREND');
  const [activeTf, setActiveTf] = useState<'D1' | 'H1' | '5m'>('D1');
  
  // Mobile specific: Case Selector becomes a horizontal scroll bar
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Category Selection - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
        {['TREND', 'REVERSAL', 'TRAP'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${activeCategory === cat ? 'bg-trade-accent border-trade-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
          >
            {cat === 'TREND' ? '趋势' : cat === 'REVERSAL' ? '反转' : '陷阱'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Main Chart Card */}
        <div className="flex-[2] bg-trade-secondary rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          {/* Timeframe Tabs */}
          <div className="flex bg-slate-900/50 border-b border-slate-800">
              <button onClick={() => setActiveTf('D1')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeTf === 'D1' ? 'text-trade-accent border-b-2 border-trade-accent' : 'text-slate-500'}`}>D1 战略</button>
              <button onClick={() => setActiveTf('H1')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeTf === 'H1' ? 'text-trade-accent border-b-2 border-trade-accent' : 'text-slate-500'}`}>H1 战术</button>
              <button onClick={() => setActiveTf('5m')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeTf === '5m' ? 'text-trade-accent border-b-2 border-trade-accent' : 'text-slate-500'}`}>M5 触发</button>
          </div>

          <div className="flex-1 p-2 md:p-4 min-h-[300px] md:min-h-0">
             <CaseChart caseId="case_01" timeframe={activeTf} />
          </div>

          <div className="p-3 bg-slate-900/80 text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-800">
            <span className="flex items-center gap-1"><Zap size={10} /> 动态模拟数据</span>
            <span className="font-mono">{activeTf} VIEW</span>
          </div>
        </div>

        {/* Logic Description Card - Scrollable on Mobile */}
        <div className="flex-1 bg-trade-secondary rounded-xl border border-slate-800 p-4 overflow-y-auto">
           <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
             <BrainCircuit size={16} className="text-trade-accent" /> 逻辑拆解
           </h3>
           <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-slate-800">
                <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${activeTf === 'D1' ? 'bg-trade-accent' : 'bg-slate-700'}`}></div>
                <h4 className="text-xs font-bold text-slate-400 mb-1">STEP 1: D1 战略趋势</h4>
                <p className="text-[11px] leading-relaxed text-slate-300">观察 MA60 方向及价格在该均线上方的运行状态，确定今日主基调。</p>
              </div>
              <div className="relative pl-6 border-l-2 border-slate-800">
                <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${activeTf === 'H1' ? 'bg-trade-accent' : 'bg-slate-700'}`}></div>
                <h4 className="text-xs font-bold text-slate-400 mb-1">STEP 2: H1 战术回踩</h4>
                <p className="text-[11px] leading-relaxed text-slate-300">等待价格回调至前期高点或 H1 级别的 MA60 共振区域。</p>
              </div>
              <div className="relative pl-6 border-l-2 border-slate-800">
                <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${activeTf === '5m' ? 'bg-trade-accent' : 'bg-slate-700'}`}></div>
                <h4 className="text-xs font-bold text-slate-400 mb-1">STEP 3: M5 狙击入场</h4>
                <p className="text-[11px] leading-relaxed text-slate-300">寻找底部缩量箱体或 123 结构突破，以获取极致盈亏比。</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;