import React, { useState, useMemo } from 'react';
import { TradeDirection } from '../types';
import { TrendingUp, Target, Zap, MousePointerClick, AlertTriangle, BookOpen, CheckCircle2, Microscope, Layers, Filter, ArrowUpRight, ArrowDownRight, XCircle } from 'lucide-react';
import CaseChart from './CaseChart';

type CaseCategory = 'TREND' | 'REVERSAL' | 'TRAP';

interface CaseStudy {
  id: string;
  category: CaseCategory;
  title: string;
  direction: TradeDirection;
  difficulty: 'Basic' | 'Advanced' | 'Expert';
  tags: string[];
  description: string; // 简述
  psychology: string; // 市场心理分析 (新增)
  logic: {
    step1_d1: string;
    step2_h1: string;
    step3_signal: string;
    step4_trigger: string;
    step5_execution: string;
  };
  keyTakeaway: string;
}

const CASES: CaseStudy[] = [
  // --- TREND FOLLOWING ---
  {
    id: 'case_01',
    category: 'TREND',
    title: 'RB 螺纹钢 - MA60 均线趋势回踩',
    direction: TradeDirection.LONG,
    difficulty: 'Basic',
    tags: ['MA60战法', 'Pinbar', '格兰维尔法则'],
    description: '这是本系统最核心的模型：在强劲的日线趋势中，耐心等待小时级别的深度回调，在关键均线支撑位通过信号确认入场。',
    psychology: '大资金在日线级别持续买入建立趋势。当价格短线获利回吐（回调）至平均成本线（MA60）时，主力为了护盘会再次吸筹，形成Pinbar。',
    logic: {
      step1_d1: '日线 MA60 明显向上倾斜（约 45度）。价格一直运行在 MA20 上方，近期创出新高后开始缩量回调。',
      step2_h1: '价格回调至前一波上涨的突破口，同时此处正好与 H1 的 MA60 均线重合，形成“双重支撑”共振。',
      step3_signal: '在支撑区域，价格先是急跌，随后收出一根带有长下影线的 Pinbar（锤子线），且成交量放大。',
      step4_trigger: '5分钟图上，Pinbar 形成后，价格做了一个微小的“箱体震荡”。当价格突破箱体上沿时，触发入场。',
      step5_execution: '止损放在 Pinbar 最低点下方。第一目标位为前高。'
    },
    keyTakeaway: '“顺大势，逆小势”。日线必须强，小时线回调必须深（打到关键位）。不要在半山腰进场。'
  },
  {
    id: 'case_04',
    category: 'TREND',
    title: 'MA 甲醇 - 关键压力位突破回踩 (顶底互换)',
    direction: TradeDirection.LONG,
    difficulty: 'Advanced',
    tags: ['顶底互换', 'N字结构', '突破回踩'],
    description: '价格突破了长达数周的盘整区间上沿，随后缩量回落测试该水平位。原压力变支撑，是极佳的入场点。',
    psychology: '突破压力位意味着空头止损离场，多头主导战场。随后的回落是“测试”突破的有效性，也是给踏空资金的上车机会。',
    logic: {
        step1_d1: '日线走出一个巨大的“上升三角形”，昨日一根大阳线强势突破了压制 20 天的水平压力位 2500。',
        step2_h1: '突破后价格没有直接起飞，而是缓慢阴跌回踩 2500 整数关口。此时 2500 从天花板变成了地板（Role Reversal）。',
        step3_signal: '在 2500 附近，K线收出一组“早晨之星”或“看涨吞没”形态，表明多头在此处重新集结。',
        step4_trigger: '5分钟图形成下降楔形（Bullish Flag），随后放量突破楔形上轨。',
        step5_execution: '止损设在 2490 (水平位下方)，捕捉趋势的主升浪。'
    },
    keyTakeaway: '不要追第一个突破（容易假突破），要等突破后的回踩确认（Second Entry）。顶底互换是最可靠的价格行为。'
  },

  // --- REVERSAL ---
  {
    id: 'case_02',
    category: 'REVERSAL',
    title: 'TA PTA - 跌破趋势线后的反抽 (2B法则)',
    direction: TradeDirection.SHORT,
    difficulty: 'Advanced',
    tags: ['趋势线突破', '2B法则', '反抽'],
    description: '当一段长期的上涨趋势被打破后，市场往往不会直接崩盘，而是会反抽测试趋势线背面。这是绝佳的做空机会。',
    psychology: '多头不死心试图抄底，推高价格。但因大势已去，买盘不足，价格在碰到原趋势线反压时迅速崩溃，套牢最后一批多头。',
    logic: {
      step1_d1: '日线价格有效跌破了维持 3 个月的上升趋势线，并且 MA20 开始拐头向下死叉 MA60。',
      step2_h1: '价格经历一波下跌后开始反弹（反抽），精准测试了原上升趋势线的背面（压力位）。',
      step3_signal: '在压力位，K线收出一根巨大的“阴包阳”（看跌吞没形态），直接吃掉了前面三根小阳线的涨幅。',
      step4_trigger: '5分钟图上，价格走出了一个向下的“N字结构”跌破颈线。',
      step5_execution: '严格以吞没形态的高点作为防守止损。计算仓位进场。'
    },
    keyTakeaway: '趋势线跌破后的第一次反抽，胜率极高。此时多头不死心试图抄底，但会成为空头的燃料。'
  },
  {
    id: 'case_05',
    category: 'REVERSAL',
    title: 'P 棕榈油 - 日线阻力处的双顶 (M头)',
    direction: TradeDirection.SHORT,
    difficulty: 'Basic',
    tags: ['双顶', '背离', '颈线突破'],
    description: '价格在历史高位两次尝试突破失败，形成 M 头结构。第二次冲高失败是明确的动能衰竭信号。',
    psychology: '第一次冲高是惯性；第二次冲高是诱多。当第二次无法创出新高且快速回落时，说明买盘彻底枯竭，主力正在派发筹码。',
    logic: {
        step1_d1: '价格触及年线压力位。RSI 指标出现明显的顶背离（价格新高，指标未新高）。',
        step2_h1: '在压力区形成了标准的“双顶 (Double Top)”结构。右峰明显低于左峰，且成交量萎缩。',
        step3_signal: '一根大阴线跌破了双顶的“颈线”支撑位，确认头部形态成立。',
        step4_trigger: '5分钟图在跌破颈线后，做了一个小幅度的回抽确认（Lower High），随后加速下跌。',
        step5_execution: '止损设在右峰高点上方。目标位一倍测量幅度。'
    },
    keyTakeaway: '在大周期压力位出现的形态才有效。H1 的双顶如果不配合 D1 的压力，很可能是中继形态而非反转形态。'
  },

  // --- TRAP ---
  {
    id: 'case_03',
    category: 'TRAP',
    title: '陷阱：震荡市中的假突破 (追涨杀跌)',
    direction: TradeDirection.LONG,
    difficulty: 'Basic',
    tags: ['均线纠缠', '窄幅震荡', '绞肉机'],
    description: '这是一个很多新手容易亏损的案例。看似有信号，但忽略了最大的前提——环境。',
    psychology: '市场缺乏合力，多空分歧巨大。此时的突破通常是止损盘触发造成的瞬间假象，随后价格会迅速回归均值。',
    logic: {
      step1_d1: '【致命错误】MA60 走平，价格在均线上下反复穿梭。道氏结构高低点杂乱无章。',
      step2_h1: '价格虽然到了所谓的“支撑位”，但因为大周期无方向，这个支撑位极其脆弱。',
      step3_signal: '收出了 Pinbar，看似不错，诱惑新手进场。',
      step4_trigger: '追高进场。',
      step5_execution: '进场后价格迅速反转打掉止损。震荡市不做趋势单！'
    },
    keyTakeaway: '没有 D1 的趋势支持，一切 H1 的信号都是噪音。管住手，震荡市休息就是赚钱！'
  }
];

type Timeframe = 'D1' | 'H1' | '5m';

const LearningCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CaseCategory>('TREND');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [activeTf, setActiveTf] = useState<Timeframe>('D1');

  // Filter cases based on category
  const filteredCases = useMemo(() => CASES.filter(c => c.category === activeCategory), [activeCategory]);
  
  // Set default active case when category changes
  useMemo(() => {
      if (filteredCases.length > 0) {
          setSelectedCaseId(filteredCases[0].id);
          setActiveTf('D1');
      }
  }, [activeCategory, filteredCases]);

  const activeCase = CASES.find(c => c.id === selectedCaseId) || CASES[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-fadeIn">
      
      {/* Category Tabs */}
      <div className="flex gap-2">
         <CategoryTab 
            active={activeCategory === 'TREND'} 
            onClick={() => setActiveCategory('TREND')}
            icon={<ArrowUpRight size={18}/>}
            label="顺势突破策略"
            color="text-blue-400 border-blue-500"
         />
         <CategoryTab 
            active={activeCategory === 'REVERSAL'} 
            onClick={() => setActiveCategory('REVERSAL')}
            icon={<ArrowDownRight size={18}/>}
            label="顶部/底部反转"
            color="text-purple-400 border-purple-500"
         />
         <CategoryTab 
            active={activeCategory === 'TRAP'} 
            onClick={() => setActiveCategory('TRAP')}
            icon={<XCircle size={18}/>}
            label="典型陷阱 (反面教材)"
            color="text-red-400 border-red-500"
         />
      </div>

      <div className="flex gap-4 h-1/4 min-h-[180px]">
        {/* Case List */}
        <div className="w-1/3 bg-trade-secondary rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Filter size={14} className="text-slate-400"/> 
              {activeCategory === 'TREND' && '趋势跟踪案例'}
              {activeCategory === 'REVERSAL' && '结构反转案例'}
              {activeCategory === 'TRAP' && '陷阱识别案例'}
            </h3>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{filteredCases.length} 个</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredCases.map(c => (
              <div 
                key={c.id}
                onClick={() => { setSelectedCaseId(c.id); setActiveTf('D1'); }}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-700 ${activeCase.id === c.id ? 'bg-slate-700 border-trade-accent ring-1 ring-trade-accent' : 'bg-slate-800 border-slate-700'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${c.direction === TradeDirection.LONG ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {c.direction === TradeDirection.LONG ? 'LONG 做多' : 'SHORT 做空'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${c.difficulty === 'Basic' ? 'border-green-800 text-green-500' : 'border-orange-800 text-orange-500'}`}>
                    {c.difficulty}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{c.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Intro & Takeaway */}
        <div className="flex-1 bg-trade-secondary rounded-lg border border-slate-700 p-6 flex flex-col justify-center relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                {activeCase.category === 'TREND' && <TrendingUp size={200} />}
                {activeCase.category === 'REVERSAL' && <ArrowDownRight size={200} />}
                {activeCase.category === 'TRAP' && <AlertTriangle size={200} />}
             </div>

             <div className="flex items-center gap-3 mb-2 relative z-10">
                 <h2 className="text-2xl font-bold text-white">{activeCase.title}</h2>
                 <div className="flex gap-2">
                    {activeCase.tags.map(t => <span key={t} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-600">#{t}</span>)}
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 relative z-10">
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">情景描述</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{activeCase.description}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><BookOpen size={12}/> 市场心理分析</h4>
                    <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-slate-600 pl-3">
                        "{activeCase.psychology}"
                    </p>
                </div>
             </div>

             <div className="bg-trade-accent/10 border border-trade-accent/30 p-3 rounded-lg flex items-center gap-3 relative z-10">
                <Target size={20} className="text-trade-accent shrink-0"/> 
                <p className="text-white text-sm font-medium">
                    <span className="text-trade-accent">Key Takeaway:</span> {activeCase.keyTakeaway}
                </p>
            </div>
        </div>
      </div>

      {/* Bottom Section: Chart & Logic */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
         {/* Chart Area */}
         <div className="w-2/3 bg-trade-secondary rounded-lg border border-slate-700 flex flex-col">
            
            {/* Timeframe Switcher */}
            <div className="flex bg-slate-800 border-b border-slate-700">
                <button 
                    onClick={() => setActiveTf('D1')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTf === 'D1' ? 'bg-trade-secondary text-white border-t-2 border-t-trade-accent' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                >
                    <TrendingUp size={16} /> D1 战略趋势 <span className="text-xs opacity-50 bg-slate-900 px-1 rounded">Step 1</span>
                </button>
                <button 
                    onClick={() => setActiveTf('H1')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTf === 'H1' ? 'bg-trade-secondary text-white border-t-2 border-t-trade-accent' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                >
                    <Layers size={16} /> H1 战术区域 <span className="text-xs opacity-50 bg-slate-900 px-1 rounded">Step 2-3</span>
                </button>
                <button 
                    onClick={() => setActiveTf('5m')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTf === '5m' ? 'bg-trade-secondary text-white border-t-2 border-t-trade-accent' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                >
                    <Microscope size={16} /> 5m 狙击执行 <span className="text-xs opacity-50 bg-slate-900 px-1 rounded">Step 4-5</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 p-4">
                <CaseChart caseId={activeCase.id} timeframe={activeTf} />
            </div>
            
            <div className="bg-slate-900 px-4 py-2 text-xs text-slate-500 border-t border-slate-700 flex justify-between">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> 实时模拟生成</span>
                <span>当前视角: <span className="text-trade-accent font-bold">{activeTf}</span></span>
            </div>
         </div>

         {/* Logic Steps - Auto Highlight based on TF */}
         <div className="w-1/3 bg-trade-secondary rounded-lg border border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Zap size={18} className="text-yellow-400" /> 逻辑拆解
            </h3>
            
            <div className="space-y-6 relative border-l-2 border-slate-700 ml-2">
                 <StepItem 
                    num="1" color="blue" icon={<TrendingUp size={14}/>} 
                    title="D1 战略趋势" 
                    desc={activeCase.logic.step1_d1} 
                    isActive={activeTf === 'D1'}
                 />
                 <StepItem 
                    num="2" color="purple" icon={<Target size={14}/>} 
                    title="H1 战术区域" 
                    desc={activeCase.logic.step2_h1} 
                    isActive={activeTf === 'H1'}
                 />
                 <StepItem 
                    num="3" color="yellow" icon={<AlertTriangle size={14}/>} 
                    title="H1 信号确认" 
                    desc={activeCase.logic.step3_signal} 
                    isActive={activeTf === 'H1'}
                 />
                 <StepItem 
                    num="4" color="orange" icon={<MousePointerClick size={14}/>} 
                    title="5m 触发" 
                    desc={activeCase.logic.step4_trigger} 
                    isActive={activeTf === '5m'}
                 />
                 <StepItem 
                    num="5" color="green" icon={<CheckCircle2 size={14}/>} 
                    title="执行与风控" 
                    desc={activeCase.logic.step5_execution} 
                    isActive={activeTf === '5m'}
                 />
            </div>
         </div>
      </div>
    </div>
  );
};

const CategoryTab = ({ active, onClick, icon, label, color }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${active ? `bg-slate-800 ${color} ring-1 ring-opacity-50` : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
    >
        <span className={active ? color.split(' ')[0] : ''}>{icon}</span>
        <span className={`text-sm font-bold ${active ? 'text-white' : ''}`}>{label}</span>
    </button>
)

const StepItem = ({ num, color, icon, title, desc, isActive }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-400 border-blue-500',
        purple: 'text-purple-400 border-purple-500',
        yellow: 'text-yellow-400 border-yellow-500',
        orange: 'text-orange-400 border-orange-500',
        green: 'text-green-400 border-green-500',
    };

    return (
        <div className={`pl-6 relative transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
            <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-900 border-2 ${colorClasses[color].split(' ')[1]} ${isActive ? 'animate-pulse' : ''}`}></div>
            <h4 className={`text-sm font-bold mb-1 flex items-center gap-2 ${colorClasses[color].split(' ')[0]}`}>
                {icon} Step {num}: {title}
            </h4>
            <div className={`text-xs leading-relaxed p-3 rounded border transition-colors ${isActive ? 'bg-slate-800 border-slate-600 text-slate-200 shadow-lg' : 'bg-transparent border-transparent text-slate-500'}`}>
                {desc}
            </div>
        </div>
    );
};

export default LearningCenter;