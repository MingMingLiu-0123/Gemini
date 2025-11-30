import React, { useState, useEffect } from 'react';
import { Trade, TradeDirection, TradeStatus, DEFAULT_SETTINGS } from '../types';
import { ArrowRight, AlertTriangle, CheckCircle, Calculator, Info, ShieldAlert } from 'lucide-react';
import { saveTrade } from '../services/storage';

interface StepWizardProps {
  onComplete: () => void;
}

const StepWizard: React.FC<StepWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.LONG);
  const [asset, setAsset] = useState('rb2601'); // Default example from PDF
  
  // Form State
  const [d1Checks, setD1Checks] = useState({ ma60: false, ma20: false, dow: false });
  const [h1Checks, setH1Checks] = useState({ level: false, ma: false, trendline: false });
  const [signal, setSignal] = useState('');
  const [trigger, setTrigger] = useState('');
  
  // Calculator State
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(10); // Default 10 for Rebar
  const [calculatedSize, setCalculatedSize] = useState(0);
  const [risk, setRisk] = useState(0);
  
  // Step 1: D1 Validation
  const isStep1Valid = Object.values(d1Checks).every(Boolean);
  
  // Step 2: H1 Validation (At least 2 conditions)
  const isStep2Valid = Object.values(h1Checks).filter(Boolean).length >= 2;
  
  // Step 3: Signal
  const isStep3Valid = signal !== '';

  // Step 4: Calculation Logic
  useEffect(() => {
    if (entryPrice > 0 && stopLoss > 0) {
      const dist = Math.abs(entryPrice - stopLoss);
      const singleLotRisk = dist * multiplier;
      
      if (singleLotRisk === 0) return;
      
      // Formula: MaxRisk / (Distance * Multiplier)
      // Max Risk is hardcoded 360 CNY based on PDF
      const maxRisk = DEFAULT_SETTINGS.maxRiskAmount;
      const lots = Math.floor(maxRisk / singleLotRisk);
      
      setCalculatedSize(lots);
      setRisk(lots * singleLotRisk);
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
      entryPrice,
      stopLossPrice: stopLoss,
      takeProfitPrice: 0, // Set later during management
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
            <h2 className="text-2xl font-bold text-white">
              {step === 1 && "Step 1: D1 Strategic Trend (The General)"}
              {step === 2 && "Step 2: H1 Tactical Zone (The Ambush)"}
              {step === 3 && "Step 3: 30m/15m Signal (The Brake)"}
              {step === 4 && "Step 4: 5m Trigger (The Sniper)"}
              {step === 5 && "Step 5: Execution & Risk (The Command)"}
            </h2>
            <p className="text-trade-muted text-sm mt-1">
              {step === 1 && "Determine if we can trade today. Do not fight the daily trend."}
              {step === 2 && "Find the high R:R support/resistance zone."}
              {step === 3 && "Wait for price to stop falling/rising. Confirm with volume."}
              {step === 4 && "Find the micro-structure breakout for tight stop loss."}
              {step === 5 && "Calculate size strictly based on 360 CNY risk."}
            </p>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-400">Direction:</span>
                <div className="flex bg-slate-900 rounded p-1">
                    <button 
                        onClick={() => setDirection(TradeDirection.LONG)}
                        className={`px-3 py-1 rounded text-xs font-bold ${direction === TradeDirection.LONG ? 'bg-trade-success text-white' : 'text-slate-500'}`}
                    >LONG</button>
                    <button 
                        onClick={() => setDirection(TradeDirection.SHORT)}
                        className={`px-3 py-1 rounded text-xs font-bold ${direction === TradeDirection.SHORT ? 'bg-trade-danger text-white' : 'text-slate-500'}`}
                    >SHORT</button>
                </div>
             </div>
             <input 
                type="text" 
                value={asset}
                onChange={(e) => setAsset(e.target.value.toUpperCase())}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-32 text-right"
                placeholder="Asset (e.g. RB)"
             />
          </div>
        </div>

        {/* Step 1 Content */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckCard 
                    label="MA60 Direction" 
                    sub="Is MA60 flat or pointing in your direction?" 
                    checked={d1Checks.ma60} 
                    onChange={() => setD1Checks({...d1Checks, ma60: !d1Checks.ma60})}
                />
                <CheckCard 
                    label="MA Alignment" 
                    sub={direction === TradeDirection.LONG ? "Price > MA20 > MA60" : "Price < MA20 < MA60"} 
                    checked={d1Checks.ma20} 
                    onChange={() => setD1Checks({...d1Checks, ma20: !d1Checks.ma20})}
                />
                <CheckCard 
                    label="Dow Structure" 
                    sub={direction === TradeDirection.LONG ? "Higher Highs, Higher Lows" : "Lower Lows, Lower Highs"} 
                    checked={d1Checks.dow} 
                    onChange={() => setD1Checks({...d1Checks, dow: !d1Checks.dow})}
                />
            </div>
            {!isStep1Valid && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-200 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span>If D1 conditions are not met, <strong>switch assets</strong>. Do not force a trade.</span>
                </div>
            )}
          </div>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30 mb-4 text-blue-200 text-sm">
                Rule: You need at least <strong>2 resonance factors</strong> to consider this a valid zone.
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckCard 
                    label="Horizontal Level" 
                    sub="Previous High/Low flip or dense area." 
                    checked={h1Checks.level} 
                    onChange={() => setH1Checks({...h1Checks, level: !h1Checks.level})}
                />
                <CheckCard 
                    label="MA Support" 
                    sub="H1 MA60 or H4 MA20 interaction." 
                    checked={h1Checks.ma} 
                    onChange={() => setH1Checks({...h1Checks, ma: !h1Checks.ma})}
                />
                <CheckCard 
                    label="Trendline" 
                    sub="Touching a major trendline connection." 
                    checked={h1Checks.trendline} 
                    onChange={() => setH1Checks({...h1Checks, trendline: !h1Checks.trendline})}
                />
            </div>
          </div>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-medium text-white mb-2">Select the confirmation pattern seen on 30m/15m:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Pinbar / Hammer', 'Engulfing', 'W-Bottom / M-Top', 'Dow 123 (No New Low)'].map((s) => (
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
                    <h4 className="font-bold text-white text-sm mb-1">Volume Check:</h4>
                    <p className="text-slate-400 text-sm">Ensure volume shrank during the pullback and expands on the signal candle.</p>
                </div>
            )}
          </div>
        )}

        {/* Step 4 Content */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-medium text-white mb-2">Identify 5m Trigger:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Box Breakout', 'Trendline Break', 'N-Pattern'].map((t) => (
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
                <p>Wait for the 5m candle to <strong>close</strong> or break strongly. Do not anticipate. Place SL 2-3 ticks below the structural low.</p>
            </div>
          </div>
        )}

        {/* Step 5 Content - Calculator */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calculator size={20} /> Position Sizing
                    </h3>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Entry Price</label>
                        <input type="number" value={entryPrice} onChange={e => setEntryPrice(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Stop Loss Price</label>
                        <input type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Contract Multiplier (e.g., 10 for RB)</label>
                        <input type="number" value={multiplier} onChange={e => setMultiplier(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-trade-accent outline-none" />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex flex-col justify-center">
                     <div className="mb-4">
                        <span className="text-slate-400 text-sm">Account Risk Limit</span>
                        <div className="text-2xl font-bold text-white">¥360.00</div>
                     </div>
                     
                     <div className="mb-4">
                        <span className="text-slate-400 text-sm">Stop Loss Distance</span>
                        <div className="text-xl text-white">{entryPrice && stopLoss ? Math.abs(entryPrice - stopLoss).toFixed(1) : 0} points</div>
                     </div>

                     <div className="p-4 bg-slate-800 rounded border border-slate-600">
                        <span className="text-slate-400 text-sm">Allowed Position Size</span>
                        <div className="text-4xl font-bold text-trade-accent my-1">
                            {calculatedSize} <span className="text-lg text-slate-500">Lots</span>
                        </div>
                        <div className={`text-xs ${risk > 360 ? 'text-red-400' : 'text-green-400'}`}>
                            Est. Loss: ¥{risk.toFixed(1)}
                        </div>
                     </div>

                     {calculatedSize === 0 && entryPrice > 0 && (
                         <p className="text-red-400 text-xs mt-2">Stop loss too wide for account size! Tighten SL or skip.</p>
                     )}
                </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-700">
            <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-2 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
                Back
            </button>
            
            {step < 5 ? (
                <button 
                    onClick={() => setStep(s => s + 1)}
                    disabled={
                        (step === 1 && !isStep1Valid) ||
                        (step === 2 && !isStep2Valid) ||
                        (step === 3 && !isStep3Valid) ||
                        (step === 4 && !trigger)
                    }
                    className="bg-trade-accent hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded font-medium flex items-center gap-2 transition-colors"
                >
                    Next Step <ArrowRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleFinish}
                    disabled={calculatedSize <= 0}
                    className="bg-trade-success hover:bg-emerald-600 disabled:bg-slate-700 text-white px-8 py-2 rounded font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                >
                    <ShieldAlert size={18} /> EXECUTE TRADE
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

const CheckCard = ({ label, sub, checked, onChange }: { label: string, sub: string, checked: boolean, onChange: () => void }) => (
    <div 
        onClick={onChange}
        className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${checked ? 'bg-blue-900/20 border-trade-accent' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
    >
        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${checked ? 'bg-trade-accent border-trade-accent' : 'border-slate-500'}`}>
            {checked && <CheckCircle size={12} className="text-white" />}
        </div>
        <div>
            <div className={`font-bold ${checked ? 'text-white' : 'text-slate-300'}`}>{label}</div>
            <div className="text-xs text-slate-500 mt-1">{sub}</div>
        </div>
    </div>
);

export default StepWizard;