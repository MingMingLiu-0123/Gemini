import React, { useState, useEffect } from 'react';
import { Trade, TradeDirection, TradeStatus, DEFAULT_SETTINGS } from '../types';
import { ArrowRight, AlertTriangle, CheckCircle, Calculator, Info, ShieldAlert, ThermometerSun, BrainCircuit, ListChecks } from 'lucide-react';
import { saveTrade } from '../services/storage';

interface StepWizardProps {
  onComplete: () => void;
}

const StepWizard: React.FC<StepWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // Start at 0 for Checklist
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.LONG);
  const [asset, setAsset] = useState('rb2601'); 
  
  // Step 0: Pre-flight Checklist
  const [preFlight, setPreFlight] = useState({
      calm: false,
      noNews: false,
      acceptRisk: false,
      planned: false
  });

  // Form State
  const [d1Checks, setD1Checks] = useState({ ma60: false, ma20: false, dow: false });
  const [h1Checks, setH1Checks] = useState({ level: false, ma: false, trendline: false });
  const [signal, setSignal] = useState('');
  const [trigger, setTrigger] = useState('');
  
  // Calculator State
  // Changed to string to allow empty input without leading 0
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [multiplier, setMultiplier] = useState<number>(10); 
  const [calculatedSize, setCalculatedSize] = useState(0);
  const [risk, setRisk] = useState(0);
  
  // Validation
  const isPreFlightValid = Object.values(preFlight).every(Boolean);
  const isStep1Valid = Object.values(d1Checks).every(Boolean);
  const isStep2Valid = Object.values(h1Checks).filter(Boolean).length >= 2;
  const isStep3Valid = signal !== '';

  // Step 4: Calculation Logic
  useEffect(() => {
    const ep = Number(entryPrice);
    const sl = Number(stopLoss);

    if (ep > 0 && sl > 0) {
      const dist = Math.abs(ep - sl);
      const singleLotRisk = dist * multiplier;
      
      if (singleLotRisk === 0) {
          setCalculatedSize(0);
          setRisk(0);
          return;
      }
      
      const maxRisk = DEFAULT_SETTINGS.maxRiskAmount;
      const lots = Math.floor(maxRisk / singleLotRisk);
      
      setCalculatedSize(lots);
      setRisk(lots * singleLotRisk);
    } else {
        setCalculatedSize(0);
        setRisk(0);
    }
  }, [entryPrice, stopLoss, multiplier]);

  const handleFinish = () => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      asset,
      direction,
      d1ConditionsMet: true,
      h1ZoneType: Object.keys(h1Checks).filter(k => h1Checks[k as keyof typeof h1Checks]),
      entrySignal: signal,
      triggerType: trigger,
      entryPrice: Number(entryPrice),
      stopLossPrice: Number(stopLoss),
      takeProfitPrice: 0, 
      riskAmount: risk,
      contractMultiplier: multiplier,
      positionSize: calculatedSize,
      status: TradeStatus.OPEN
    };
    
    saveTrade(newTrade);
    onComplete();
  };

  return (
    <div className="bg-trade-secondary rounded-lg border border-slate-700 shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-slate-800 h-2 w-full">
        <div 
          className="bg-trade-accent h-full transition-all duration-500 ease-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="p-6 md:p-8">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {step === 0 && <><ListChecks className="text-trade-accent"/> 交易前检查 (Pre-Flight)</>}
              {step === 1 && "第一步：D1 战略趋势（大势）"}
              {step === 2 && "第二步：H1 战术区域（埋伏）"}
              {step === 3 && "第三步：30m/15m 信号（刹车）"}
              {step === 4 && "第四步：5m 触发（狙击）"}
              {step === 5 && "第五步：执行与风控（指令）"}
            </h2>
            <p className="text-trade-muted text-sm mt-1">
              {step === 0 && "成功的交易始于良好的状态。请诚实回答以下问题。"}
              {step === 1 && "判断今日是否可以交易。顺大势，逆小势。"}
              {step === 2 && "寻找高盈亏比的支撑/压力区域。"}
              {step === 3 && "等待价格止跌/止涨。通过成交量确认。"}
              {step === 4 && "寻找微观结构的突破，以获取窄止损。"}
              {step === 5 && "严格基于 360 元风险限额计算仓位。"}
            </p>
          </div>
          {step > 0 && (
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-400">方向:</span>
                    <div className="flex bg-slate-900 rounded p-1">
                        <button 
                            onClick={() => setDirection(TradeDirection.LONG)}
                            className={`px-3 py-1 rounded text-xs font-bold ${direction === TradeDirection.LONG ? 'bg-trade-success text-white' : 'text-slate-500'}`}
                        >做多 (LONG)</button>
                        <button 
                            onClick={() => setDirection(TradeDirection.SHORT)}
                            className={`px-3 py-1 rounded text-xs font-bold ${direction === TradeDirection.SHORT ? 'bg-trade-danger text-white' : 'text-slate-500'}`}
                        >做空 (SHORT)</button>
                    </div>
                </div>
                <input 
                    type="text" 
                    value={asset}
                    onChange={(e) => setAsset(e.target.value.toUpperCase())}
                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-32 text-right"
                    placeholder="品种 (如 RB)"
                />
            </div>
          )}
        </div>

        {/* Step 0: Pre-flight Checklist */}
        {step === 0 && (
            <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CheckCard 
                        label="心态检查" 
                        sub="我此刻心态平静，没有报复市场的心理，也没有过度亢奋。" 
                        checked={preFlight.calm} 
                        onChange={() => setPreFlight({...preFlight, calm: !preFlight.calm})}
                        icon={<BrainCircuit size={18}/>}
                    />
                    <CheckCard 
                        label="环境检查" 
                        sub="未来一小时无重大经济数据发布，周围环境安静。" 
                        checked={preFlight.noNews} 
                        onChange={() => setPreFlight({...preFlight, noNews: !preFlight.noNews})}
                        icon={<ThermometerSun size={18}/>}
                    />
                     <CheckCard 
                        label="风险接受度" 
                        sub="我已经做好了这笔交易可能亏损 360 元的心理准备，并完全接受它。" 
                        checked={preFlight.acceptRisk} 
                        onChange={() => setPreFlight({...preFlight, acceptRisk: !preFlight.acceptRisk})}
                        icon={<ShieldAlert size={18}/>}
                    />
                     <CheckCard 
                        label="计划一致性" 
                        sub="这笔交易符合我的计划，而不是因为看着价格波动而临时起意。" 
                        checked={preFlight.planned} 
                        onChange={() => setPreFlight({...preFlight, planned: !preFlight.planned})}
                        icon={<ListChecks size={18}/>}
                    />
                </div>
                {!isPreFlightValid && (
                    <div className="mt-4 text-center text-slate-400 text-sm">
                        请勾选以上所有项目以解锁交易向导。如果是冲动交易，请关闭电脑去散步。
                    </div>
                )}
            </div>
        )}

        {/* Step 1 Content */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckCard 
                    label="MA60 方向" 
                    sub="MA60 是否走平或指向你的交易方向？" 
                    checked={d1Checks.ma60} 
                    onChange={() => setD1Checks({...d1Checks, ma60: !d1Checks.ma60})}
                />
                <CheckCard 
                    label="均线排列" 
                    sub={direction === TradeDirection.LONG ? "价格 > MA20 > MA60" : "价格 < MA20 < MA60"} 
                    checked={d1Checks.ma20} 
                    onChange={() => setD1Checks({...d1Checks, ma20: !d1Checks.ma20})}
                />
                <CheckCard 
                    label="道氏结构" 
                    sub={direction === TradeDirection.LONG ? "高点更高，低点更高" : "低点更低，高点更低"} 
                    checked={d1Checks.dow} 
                    onChange={() => setD1Checks({...d1Checks, dow: !d1Checks.dow})}
                />
            </div>
            {!isStep1Valid && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-200 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span>如果 D1 条件不满足，请 **切换品种**。不要强行交易。</span>
                </div>
            )}
          </div>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30 mb-4 text-blue-200 text-sm">
                规则：你需要至少满足 **2 个共振因子** 才能确认为有效区域。
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckCard 
                    label="水平关键位" 
                    sub="之前的顶底转换位或密集成交区。" 
                    checked={h1Checks.level} 
                    onChange={() => setH1Checks({...h1Checks, level: !h1Checks.level})}
                />
                <CheckCard 
                    label="MA 均线支撑" 
                    sub="H1 MA60 或 H4 MA20 的相互作用。" 
                    checked={h1Checks.ma} 
                    onChange={() => setH1Checks({...h1Checks, ma: !h1Checks.ma})}
                />
                <CheckCard 
                    label="趋势线" 
                    sub="触碰主要趋势线连接点。" 
                    checked={h1Checks.trendline} 
                    onChange={() => setH1Checks({...h1Checks, trendline: !h1Checks.trendline})}
                />
            </div>
          </div>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-medium text-white mb-2">选择 30m/15m 出现的确认信号：</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Pinbar / 锤子线', '吞没形态', 'W底 / M顶', '道氏 123 (无新低)'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setSignal(s)}
                        className={`p-4 rounded border text-left transition-all ${signal === s ? 'bg-trade-accent border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        <div className="font-bold">{s}</div>
                    </button>
                ))}
            </div>
            {signal && (
                <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-600">
                    <h4 className="font-bold text-white text-sm mb-1">成交量检查：</h4>
                    <p className="text-slate-400 text-sm">确认回调时缩量，信号烛台放量。</p>
                </div>
            )}
          </div>
        )}

        {/* Step 4 Content */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-medium text-white mb-2">识别 5m 触发结构：</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['箱体突破', '趋势线突破', 'N字结构'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTrigger(t)}
                        className={`p-4 rounded border text-left transition-all ${trigger === t ? 'bg-trade-accent border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        <div className="font-bold">{t}</div>
                    </button>
                ))}
            </div>
            
            <div className="bg-yellow-500/10 p-4 rounded border border-yellow-500/30 mt-4 text-yellow-200 text-sm flex items-start gap-2">
                <Info className="shrink-0 mt-0.5" size={16} />
                <p>等待 5m K线 **收盘** 或强力突破。不要提前预测。止损设在结构低点下方 2-3 跳。</p>
            </div>
          </div>
        )}

        {/* Step 5 Content - Calculator */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calculator size={20} /> 仓位计算器
                    </h3>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">入场价格</label>
                        <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" placeholder="输入价格" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">止损价格</label>
                        <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" placeholder="输入价格" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">合约乘数 (例如 螺纹钢为 10)</label>
                        <input type="number" value={multiplier} onChange={e => setMultiplier(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex flex-col justify-center">
                     <div className="mb-4">
                        <span className="text-slate-400 text-sm">账户风险限额</span>
                        <div className="text-2xl font-bold text-white">¥360.00</div>
                     </div>
                     
                     <div className="mb-4">
                        <span className="text-slate-400 text-sm">止损距离</span>
                        <div className="text-xl text-white">{Number(entryPrice) && Number(stopLoss) ? Math.abs(Number(entryPrice) - Number(stopLoss)).toFixed(1) : 0} 点</div>
                     </div>

                     <div className="p-4 bg-slate-800 rounded border border-slate-600">
                        <span className="text-slate-400 text-sm">允许开仓手数</span>
                        <div className="text-4xl font-bold text-trade-accent my-1">
                            {calculatedSize} <span className="text-lg text-slate-500">手</span>
                        </div>
                        <div className={`text-xs ${risk > 360 ? 'text-red-400' : 'text-green-400'}`}>
                            预估亏损: ¥{risk.toFixed(1)}
                        </div>
                     </div>

                     {calculatedSize === 0 && Number(entryPrice) > 0 && (
                         <p className="text-red-400 text-xs mt-2">止损太宽，超过单手最大风险！请收紧止损或放弃。</p>
                     )}
                </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-700">
            <button 
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-6 py-2 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
                上一步
            </button>
            
            {step < 5 ? (
                <button 
                    onClick={() => setStep(s => s + 1)}
                    disabled={
                        (step === 0 && !isPreFlightValid) ||
                        (step === 1 && !isStep1Valid) ||
                        (step === 2 && !isStep2Valid) ||
                        (step === 3 && !isStep3Valid) ||
                        (step === 4 && !trigger)
                    }
                    className="bg-trade-accent hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded font-medium flex items-center gap-2 transition-colors"
                >
                    {step === 0 ? "开始交易计划" : "下一步"} <ArrowRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleFinish}
                    disabled={calculatedSize <= 0}
                    className="bg-trade-success hover:bg-emerald-600 disabled:bg-slate-700 text-white px-8 py-2 rounded font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                >
                    <ShieldAlert size={18} /> 执行交易
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

const CheckCard = ({ label, sub, checked, onChange, icon }: { label: string, sub: string, checked: boolean, onChange: () => void, icon?: React.ReactNode }) => (
    <div 
        onClick={onChange}
        className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${checked ? 'bg-blue-900/20 border-trade-accent' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
    >
        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${checked ? 'bg-trade-accent border-trade-accent' : 'border-slate-500'}`}>
            {checked && <CheckCircle size={12} className="text-white" />}
        </div>
        <div>
            <div className={`font-bold flex items-center gap-2 ${checked ? 'text-white' : 'text-slate-300'}`}>
                {icon}
                {label}
            </div>
            <div className="text-xs text-slate-500 mt-1">{sub}</div>
        </div>
    </div>
);

export default StepWizard;