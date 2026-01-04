import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  ReferenceDot,
  Area
} from 'recharts';

// Types
export interface ChartDataPoint {
  index: number;
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  range: [number, number];
  ma20?: number;
  ma60?: number;
  volume?: number;
  highlight?: boolean;
}

interface CaseChartProps {
  caseId: string;
  timeframe: 'D1' | 'H1' | '5m';
  hideAnnotations?: boolean; // New Prop
}

// Helper: Simple OHLC generator
const createCandle = (prevClose: number, volatility: number, trend: number) => {
    const change = (Math.random() - 0.45) * volatility + trend;
    const close = prevClose + change;
    const open = prevClose + (Math.random() - 0.5) * (volatility * 0.2); // minor gap
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    return { open, close, high, low };
};

// --- DATA GENERATORS ---

// CASE 1: Long Trend (Trend Following - MA Pullback)
const getCase1Data = (tf: string): { data: ChartDataPoint[], annotations: any[] } => {
    const data: ChartDataPoint[] = [];
    let price = 3600;
    let ma60 = 3400;
    let ma20 = 3500;
    let annotations: any[] = [];

    if (tf === 'D1') {
        for (let i = 0; i < 40; i++) {
            ma60 += 5;
            ma20 = ma60 + 100 + Math.sin(i/5) * 20;
            let trend = 5; 
            if (i > 30) trend = -10; // Pullback starts
            const c = createCandle(price, 30, trend);
            price = c.close;
            data.push({ index: i, time: `Oct ${i+1}`, ...c, range: [c.low, c.high], ma60, ma20, highlight: i > 30 });
        }
        annotations = [
            <ReferenceLine key="trend" segment={[{x:5, y:data[5].low}, {x:30, y:data[30].low}]} stroke="#10b981" strokeWidth={2} label={{position:'insideBottomRight', value:'D1 主要趋势向上', fill:'#10b981'}} />,
            <ReferenceDot key="pullback" x={35} y={data[35].high} r={6} fill="#3b82f6" stroke="white" label={{position: 'top', value: '缩量回调', fill: '#3b82f6'}} />
        ];
    } else if (tf === 'H1') {
        price = 3750;
        for (let i = 0; i < 30; i++) {
             let trend = -4; 
             if (i >= 20) trend = 0; if (i > 22) trend = 2;
             const ma60_h1 = 3600; 
             const c = createCandle(price, 10, trend);
             if (i === 20) { c.open = 3610; c.close = 3615; c.low = 3590; c.high = 3618; }
             price = c.close;
             data.push({ index: i, time: `H${i}`, ...c, range: [c.low, c.high], ma60: ma60_h1, highlight: i === 20 });
        }
        annotations = [
            <ReferenceLine key="support" y={3600} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" label={{position:'left', value:'MA60支撑', fill:'#f59e0b'}} />,
            <ReferenceDot key="pinbar" x={20} y={3590} r={5} fill="#facc15" stroke="white" label={{position: 'bottom', value: 'Pinbar', fill: '#facc15'}} />
        ];
    } else {
        price = 3615;
        for (let i = 0; i < 30; i++) {
             let trend = i < 15 ? (Math.random()-0.5)*2 : (i===15?8:2);
             const c = createCandle(price, 2, trend);
             if(i < 15) { c.high = Math.min(c.high, 3622); c.low = Math.max(c.low, 3608); }
             price = c.close;
             data.push({ index: i, time: `M${i}`, ...c, range: [c.low, c.high], highlight: i === 15 });
        }
        annotations = [
            <ReferenceLine key="break" y={3622} stroke="#94a3b8" strokeDasharray="3 3" label="箱体上沿" />,
            <ReferenceDot key="entry" x={15} y={3625} r={4} fill="#10b981" label={{value:'突破', position: 'top', fill: '#10b981'}} />
        ];
    }
    return { data, annotations };
};

// CASE 4: Breakout & Retest (Role Reversal)
const getCase4Data = (tf: string): { data: ChartDataPoint[], annotations: any[] } => {
    const data: ChartDataPoint[] = [];
    let price = 2450;
    let annotations: any[] = [];

    if (tf === 'D1') {
        // Ascending triangle breakout
        for (let i = 0; i < 40; i++) {
            let trend = 2;
            if (i > 35) trend = -2; // retest
            const c = createCandle(price, 10, trend);
            if (i < 30) c.high = Math.min(c.high, 2500); // Resistance cap
            if (i === 30) { c.close = 2520; c.high = 2525; } // Breakout
            price = c.close;
            data.push({ index: i, time: `D${i}`, ...c, range: [c.low, c.high], ma20: 2400 + i*3 });
        }
        annotations = [
            <ReferenceLine key="res" y={2500} stroke="#ef4444" strokeWidth={2} label="压力位 2500" />,
            <ReferenceDot key="break" x={30} y={2520} r={4} fill="#10b981" label="大阳突破" />
        ];
    } else if (tf === 'H1') {
        // Fall back to level
        price = 2530;
        for (let i = 0; i < 30; i++) {
            let trend = -2;
            if (i >= 20) trend = 1; // bounce
            const c = createCandle(price, 5, trend);
            if (i >= 18 && i <= 22) c.low = Math.max(c.low, 2500); // Hold 2500
            price = c.close;
            data.push({ index: i, time: `H${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [
            <ReferenceLine key="supp" y={2500} stroke="#10b981" strokeWidth={2} label={{value:'顶底互换 (支撑)', fill:'#10b981'}} />,
            <ReferenceDot key="signal" x={20} y={2505} r={4} fill="#facc15" label="启明星" />
        ];
    } else {
        // Bull Flag Break
        price = 2505;
        for (let i = 0; i < 30; i++) {
            let trend = -0.5; // Flag down
            if (i >= 20) trend = 3; // Break
            const c = createCandle(price, 2, trend);
            price = c.close;
            data.push({ index: i, time: `M${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [
            <ReferenceLine key="flag" segment={[{x:0, y:2508}, {x:19, y:2500}]} stroke="#94a3b8" strokeDasharray="3 3" label="旗形整理" />,
            <ReferenceDot key="go" x={20} y={2505} r={4} fill="#10b981" label="突破" />
        ];
    }
    return { data, annotations };
};

// CASE 2: Short (Trend Break)
const getCase2Data = (tf: string): { data: ChartDataPoint[], annotations: any[] } => {
     const data: ChartDataPoint[] = [];
    let price = 5000;
    let annotations: any[] = [];

    if (tf === 'D1') {
        for (let i = 0; i < 30; i++) {
            let trend = i < 15 ? 10 : -15; 
            const c = createCandle(price, 20, trend);
            price = c.close;
            data.push({ index: i, time: `D${i}`, ...c, range: [c.low, c.high], ma20: 5000 + i*5 });
        }
        annotations = [<ReferenceLine key="break" x={15} stroke="#ef4444" label={{value:'趋势跌破', fill:'#ef4444'}} />];
    } else if (tf === 'H1') {
        price = 4800;
        for (let i = 0; i < 30; i++) {
            let trend = i < 20 ? 5 : -10;
            const c = createCandle(price, 8, trend);
            if (i === 20) { c.open = 4910; c.close = 4850; c.high = 4915; c.low = 4845; }
            price = c.close;
            data.push({ index: i, time: `H${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [<ReferenceDot key="engulf" x={20} y={4915} r={4} fill="#facc15" label={{value:'吞没形态', position:'top', fill:'#facc15'}} />];
    } else {
         price = 4850;
        for (let i = 0; i < 30; i++) {
            let trend = -2;
            if (i > 10 && i < 15) trend = 3; 
            if (i === 15) trend = -8; 
            const c = createCandle(price, 5, trend);
            price = c.close;
            data.push({ index: i, time: `M${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [<ReferenceDot key="entry" x={15} y={data[15].close} r={4} fill="#10b981" label={{value:'N字跌破', position:'bottom', fill:'#10b981'}} />];
    }
    return { data, annotations };
};

// CASE 5: Double Top (Reversal)
const getCase5Data = (tf: string): { data: ChartDataPoint[], annotations: any[] } => {
    const data: ChartDataPoint[] = [];
    let price = 8000;
    let annotations: any[] = [];

    if (tf === 'D1') {
        // Double Top
        for (let i = 0; i < 40; i++) {
             // Up then down then up then down
             let trend = Math.sin(i / 5) * 20 + 5; 
             if (i > 30) trend = -30; // crash
             const c = createCandle(price, 30, trend);
             // Cap at 8200
             if (c.high > 8200) { c.high = 8200; c.close = 8180; }
             price = c.close;
             data.push({ index: i, time: `D${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [
            <ReferenceLine key="top" y={8200} stroke="#ef4444" label="强阻力位" />,
            <ReferenceDot key="dt" x={25} y={8200} r={4} fill="#ef4444" label="双顶" />
        ];
    } else if (tf === 'H1') {
        // Neckline break
        price = 8100;
        for (let i = 0; i < 30; i++) {
            let trend = -5;
            if (i < 10) trend = 5; // Second peak approach
            const c = createCandle(price, 10, trend);
            price = c.close;
            data.push({ index: i, time: `H${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [
            <ReferenceLine key="neck" y={8000} stroke="#f59e0b" strokeDasharray="3 3" label="颈线" />,
            <ReferenceDot key="break" x={20} y={8000} r={5} fill="#ef4444" label="跌破" />
        ];
    } else {
        // Retest fail
        price = 7980;
        for (let i = 0; i < 30; i++) {
             let trend = -2;
             if (i < 10) trend = 2; // retest neckline
             if (i === 10) trend = -10; // reject
             const c = createCandle(price, 5, trend);
             price = c.close;
             data.push({ index: i, time: `M${i}`, ...c, range: [c.low, c.high] });
        }
        annotations = [
            <ReferenceLine key="neck" y={8000} stroke="#f59e0b" strokeDasharray="3 3" />,
            <ReferenceDot key="fail" x={10} y={8000} r={4} fill="#ef4444" label="反抽失败" />
        ];
    }
    return { data, annotations };
};

// CASE 3: Trap
const getCase3Data = (tf: string): { data: ChartDataPoint[], annotations: any[] } => {
     const data: ChartDataPoint[] = [];
    let price = 4000;
    let annotations: any[] = [];
    
    for (let i = 0; i < 30; i++) {
        const c = createCandle(price, 30, Math.sin(i)*20);
        price = c.close;
        data.push({ index: i, time: `D${i}`, ...c, range: [c.low, c.high], ma60: 4000 });
    }
    if (tf === 'D1') {
        annotations = [<ReferenceLine key="flat" y={4000} stroke="#94a3b8" strokeDasharray="3 3" label={{value:'均线走平(震荡)', fill:'#94a3b8'}} />];
    }
    return { data, annotations };
};


const CustomCandleShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low } = payload;
    
    if (typeof high !== 'number' || typeof low !== 'number') return null;
    const range = high - low;
    if (range <= 0 || !height) return null;

    const ratio = height / range;
    const yOpen = y + (high - open) * ratio;
    const yClose = y + (high - close) * ratio;
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);
    const isUp = close > open;
    const color = isUp ? '#ef4444' : '#10b981'; 

    return (
        <g>
            <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} strokeWidth={1} />
            <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} stroke={color} />
        </g>
    );
};

const CaseChart: React.FC<CaseChartProps> = ({ caseId, timeframe, hideAnnotations }) => {
  let chartData: { data: ChartDataPoint[], annotations: any[] } = { data: [], annotations: [] };

  switch(caseId) {
      case 'case_01': chartData = getCase1Data(timeframe); break;
      case 'case_02': chartData = getCase2Data(timeframe); break;
      case 'case_03': chartData = getCase3Data(timeframe); break;
      case 'case_04': chartData = getCase4Data(timeframe); break;
      case 'case_05': chartData = getCase5Data(timeframe); break;
      default: chartData = getCase1Data(timeframe);
  }

  const { data, annotations } = chartData;

  // Calculate domain
  const allValues = data.flatMap(d => [d.high, d.low, d.ma60, d.ma20].filter(v => v !== undefined) as number[]);
  const minPrice = Math.min(...allValues) * 0.999;
  const maxPrice = Math.max(...allValues) * 1.001;

  return (
    <div className="w-full h-[400px] bg-[#0f172a] border border-slate-700 rounded-lg p-2 relative select-none">
       <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis domain={[minPrice, maxPrice]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => val.toFixed(0)} orientation="right" axisLine={false} tickLine={false} />
            
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ display: 'none' }}
                formatter={(value: any, name: string) => {
                    if (name === 'range') return [null, null];
                    return [Number(value).toFixed(1), name];
                }}
            />
            
            {/* Indicators */}
            {(timeframe === 'D1' || timeframe === 'H1') && <Line type="monotone" dataKey="ma60" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />}
            {timeframe === 'D1' && <Line type="monotone" dataKey="ma20" stroke="#a855f7" dot={false} strokeWidth={1} strokeOpacity={0.6} isAnimationActive={false} />}

            {/* Candles */}
            <Bar dataKey="range" shape={<CustomCandleShape />} isAnimationActive={false} />

            {/* Dynamic Annotations (Only show if not hidden) */}
            {!hideAnnotations && annotations}

          </ComposedChart>
       </ResponsiveContainer>
    </div>
  );
};

export default CaseChart;