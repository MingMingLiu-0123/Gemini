import React, { useState, useEffect } from 'react';
import { Trade, TradeDirection, TradeStatus, DEFAULT_SETTINGS } from '../types';
import { ArrowRight, CheckCircle, Calculator, ShieldAlert, ArrowLeft } from 'lucide-react';
import { saveTrade } from '../services/storage';

const StepWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.LONG);
  const [asset, setAsset] = useState('rb2601');
  const [signal, setSignal] = useState('');
  const [trigger, setTrigger] = useState('');
  
  // Simple form validation
  const canNext = () => {
    if (step === 0) return true; // Prep checklist assumed
    if (step === 3) return signal !== '';
    if (step === 4) return trigger !== '';
    return true;
  };

  const handleFinish = () => {
    const newTrade: any = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      asset,
      direction,
      entrySignal: signal,
      triggerType: trigger,
      status: TradeStatus.OPEN,
      riskAmount: 360,
      positionSize: 1
    };
    saveTrade(newTrade);
    onComplete();
  };

  const stepTitles = ["前置检查", "D1大势", "H1区域", "M15信号", "M5触发", "计算风控"];

  return (
    <div className="bg-trade-secondary rounded-xl border border-slate-800 h-full flex flex-col shadow-2xl">
      {/* Progress Header */}
      <div className="p-4 border-b border-slate-800 shrink-0">
         <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-trade-accent uppercase tracking-widest">Step {step + 1} / 6</span>
            <span className="text-sm font-bold text-white">{stepTitles[step]}</span>
         </div>
         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-trade-accent h-full transition-all duration-300" style={{ width: `${((step + 1) / 6) * 100}%` }}></div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-10">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">设定品种与方向</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDirection(TradeDirection.LONG)} className={`py-4 rounded-xl border font-bold text-sm ${direction === TradeDirection.LONG ? 'bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500/20' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>做多</button>
              <button onClick={() => setDirection(TradeDirection.SHORT)} className={`py-4 rounded-xl border font-bold text-sm ${direction === TradeDirection.SHORT ? 'bg-red-500/20 border-red-500 text-red-400 ring-2 ring-red-500/20' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>做空</button>
            </div>
            <div className="mt-4">
              <label className="text-xs text-slate-500 mb-2 block">合约名称</label>
              <input type="text" value={asset} onChange={e => setAsset(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg font-bold text-white outline-none focus:border-trade-accent" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">确认刹车信号 (M15)</h3>
            {['Pinbar', '吞没形态', 'W底/M顶', '道氏123'].map(s => (
              <button key={s} onClick={() => setSignal(s)} className={`w-full p-4 rounded-xl border text-left flex justify-between items-center ${signal === s ? 'bg-trade-accent/10 border-trade-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <span className="font-bold">{s}</span>
                {signal === s && <CheckCircle size={20} className="text-trade-accent" />}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center">
              <div className="text-slate-500 text-xs mb-1">风险限额</div>
              <div className="text-3xl font-bold text-white">¥360.00</div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">建议开仓</span>
                <span className="text-2xl font-bold text-trade-accent">1 手</span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 leading-relaxed">
              严格执行此仓位。一旦进场，除了扫损或翻倍，不要手动干扰。
            </div>
          </div>
        )}

        {/* Step 1, 2, 4 simplifications... */}
        {(step === 1 || step === 2 || step === 4) && (
           <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="bg-trade-accent/10 p-4 rounded-full mb-4"><CheckCircle size={32} className="text-trade-accent" /></div>
              <h3 className="text-lg font-bold mb-2">{stepTitles[step]} 验证通过</h3>
              <p className="text-xs text-slate-500 px-8">请再次确认行情走势符合交易计划定义的标准条件。</p>
           </div>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0 flex gap-3">
        {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm">上一步</button>}
        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className={`flex-[2] py-3 bg-trade-accent text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 ${!canNext() ? 'opacity-50' : ''}`}>下一步 <ArrowRight size={18} /></button>
        ) : (
          <button onClick={handleFinish} className="flex-[2] py-3 bg-trade-success text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"><ShieldAlert size={18} /> 确认进场</button>
        )}
      </div>
    </div>
  );
};

export default StepWizard;