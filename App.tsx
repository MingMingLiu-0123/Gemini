import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, BookOpen, Settings as SettingsIcon, ClipboardList, GraduationCap } from 'lucide-react';
import StepWizard from './components/StepWizard';
import Dashboard from './components/Dashboard';
import TradeReview from './components/TradeReview';
import Settings from './components/Settings';
import LearningCenter from './components/LearningCenter';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRADE = 'NEW_TRADE',
  REVIEW = 'REVIEW',
  RULES = 'RULES',
  SETTINGS = 'SETTINGS',
  LEARNING = 'LEARNING'
}

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-trade-secondary border-r border-slate-800 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TradeLogic<span className="text-trade-accent">Pro</span>
          </h1>
          <div className="text-xs text-slate-500 mt-1">一致性训练器</div>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavButton 
            active={view === View.DASHBOARD} 
            onClick={() => setView(View.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="仪表盘" 
          />
          <NavButton 
            active={view === View.NEW_TRADE} 
            onClick={() => setView(View.NEW_TRADE)} 
            icon={<PlusCircle size={20} />} 
            label="新交易向导" 
          />
          <NavButton 
            active={view === View.REVIEW} 
            onClick={() => setView(View.REVIEW)} 
            icon={<ClipboardList size={20} />} 
            label="复盘日志" 
          />
          <NavButton 
            active={view === View.LEARNING} 
            onClick={() => setView(View.LEARNING)} 
            icon={<GraduationCap size={20} />} 
            label="案例拆解" 
          />
          <NavButton 
            active={view === View.RULES} 
            onClick={() => setView(View.RULES)} 
            icon={<BookOpen size={20} />} 
            label="策略手册" 
          />
           <div className="pt-4 border-t border-slate-800 mt-4">
            <NavButton 
                active={view === View.SETTINGS} 
                onClick={() => setView(View.SETTINGS)} 
                icon={<SettingsIcon size={20} />} 
                label="数据管理" 
            />
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 text-slate-500 text-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             系统运行中
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-trade-primary p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          {view === View.DASHBOARD && (
            <>
              <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">交易驾驶舱</h2>
                    <p className="text-slate-400 mt-2">欢迎回来。请记住：生存第一，盈利第二。</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setView(View.REVIEW)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                        <ClipboardList size={18} /> 去复盘
                    </button>
                    <button 
                        onClick={() => setView(View.NEW_TRADE)}
                        className="bg-trade-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <PlusCircle size={18} /> 开始新交易
                    </button>
                </div>
              </div>
              <Dashboard />
            </>
          )}

          {view === View.NEW_TRADE && (
             <div className="animate-slideIn">
                <div className="mb-6">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm">← 返回仪表盘</button>
                    <h2 className="text-3xl font-bold text-white">新交易执行</h2>
                </div>
                <StepWizard onComplete={() => setView(View.DASHBOARD)} />
             </div>
          )}

          {view === View.REVIEW && (
             <div className="animate-slideIn">
                <div className="mb-6">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm">← 返回仪表盘</button>
                    <h2 className="text-3xl font-bold text-white">交易复盘 & 心理分析</h2>
                    <p className="text-slate-400 mt-1 text-sm">不要浪费每一次亏损。诚实面对自己，找出一致性问题。</p>
                </div>
                <TradeReview />
             </div>
          )}

          {view === View.LEARNING && (
             <div className="animate-slideIn">
                <div className="mb-6">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm">← 返回仪表盘</button>
                    <h2 className="text-3xl font-bold text-white">经典案例拆解 (Case Studies)</h2>
                    <p className="text-slate-400 mt-1 text-sm">反复阅读这些经典模型，直到它们刻入你的潜意识。</p>
                </div>
                <LearningCenter />
             </div>
          )}

          {view === View.RULES && (
            <div className="bg-trade-secondary p-8 rounded-lg border border-slate-700 prose prose-invert max-w-none">
                <h2>1.8W 交易系统协议</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    <div className="bg-slate-800 p-6 rounded border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">1. 核心规则</h3>
                        <ul className="list-disc pl-5 text-slate-300 space-y-2">
                            <li><strong>本金：</strong> ~1.8W CNY</li>
                            <li><strong>单笔风险：</strong> 最大 2-3% (¥360)</li>
                            <li><strong>核心理念：</strong> D1 顺势跟踪 + H1 关键位反转</li>
                            <li><strong>推荐品种：</strong> 低保证金品种 (甲醇, PTA, PVC, 螺纹)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-800 p-6 rounded border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">2. 执行五步法</h3>
                        <ol className="list-decimal pl-5 text-slate-300 space-y-2">
                            <li><strong>D1 趋势：</strong> 检查 MA60 方向 & 道氏结构。</li>
                            <li><strong>H1 区域：</strong> 寻找支撑/压力。耐心等待。</li>
                            <li><strong>30m/15m 信号：</strong> 出现 Pinbar / 吞没形态。</li>
                            <li><strong>5m 触发：</strong> 突破入场 (Box/Trendline)。</li>
                            <li><strong>执行：</strong> 严格计算手数 (以损定量)。</li>
                        </ol>
                    </div>
                    <div className="bg-slate-800 p-6 rounded border border-slate-600 md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">3. 复盘标准</h3>
                        <ul className="list-disc pl-5 text-slate-300 space-y-2">
                            <li><strong>满分交易：</strong> 符合 D1 + H1 + 信号 + 触发 + 风控，无论盈亏。</li>
                            <li><strong>低分交易：</strong> 违背任意一条规则（如逆势、不止损、提前进场），即使赚钱也是错误的。</li>
                            <li><strong>改进原则：</strong> 每次复盘只找出一个需要改进的点，并在下一次交易中专注修正。</li>
                        </ul>
                    </div>
                </div>
            </div>
          )}

          {view === View.SETTINGS && (
            <Settings />
          )}

        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-trade-accent text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;