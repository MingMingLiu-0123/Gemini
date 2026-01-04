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

  const navigationItems = [
    { view: View.DASHBOARD, label: '概览', icon: <LayoutDashboard size={20} />, shortLabel: '概览' },
    { view: View.NEW_TRADE, label: '执行向导', icon: <PlusCircle size={20} />, shortLabel: '下单' },
    { view: View.REVIEW, label: '复盘日志', icon: <ClipboardList size={20} />, shortLabel: '复盘' },
    { view: View.LEARNING, label: '案例拆解', icon: <GraduationCap size={20} />, shortLabel: '案例' },
    { view: View.RULES, label: '策略手册', icon: <BookOpen size={20} />, shortLabel: '策略' },
  ];

  return (
    <div className="flex flex-col h-full bg-trade-primary">
      {/* Top Header - Mobile Only */}
      <header className="md:hidden bg-trade-secondary px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tight">
          TradeLogic<span className="text-trade-accent">Pro</span>
        </h1>
        <button onClick={() => setView(View.SETTINGS)} className="text-slate-400 p-1">
          <SettingsIcon size={20} />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-trade-secondary border-r border-slate-800 flex-col shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              TradeLogic<span className="text-trade-accent">Pro</span>
            </h1>
            <div className="text-xs text-slate-500 mt-1">一致性训练器</div>
          </div>
          
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigationItems.map(item => (
              <NavButton 
                key={item.view}
                active={view === item.view} 
                onClick={() => setView(item.view)} 
                icon={item.icon} 
                label={item.label} 
              />
            ))}
            <div className="pt-4 border-t border-slate-800 mt-4">
              <NavButton 
                  active={view === View.SETTINGS} 
                  onClick={() => setView(View.SETTINGS)} 
                  icon={<SettingsIcon size={20} />} 
                  label="数据管理" 
              />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            实时系统就绪
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden safe-pb relative pb-20 md:pb-8 p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            
            {view === View.DASHBOARD && (
              <div className="space-y-6">
                <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">交易驾驶舱</h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">欢迎回来。记住：控制亏损，盈利自理。</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setView(View.REVIEW)} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <ClipboardList size={18} /> 复盘
                    </button>
                    <button onClick={() => setView(View.NEW_TRADE)} className="flex-1 md:flex-none bg-trade-accent hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                      <PlusCircle size={18} /> 新交易
                    </button>
                  </div>
                </header>
                <Dashboard />
              </div>
            )}

            {view === View.NEW_TRADE && (
              <div className="h-full">
                <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1">← 返回概览</button>
                <StepWizard onComplete={() => setView(View.DASHBOARD)} />
              </div>
            )}

            {view === View.REVIEW && (
              <div className="h-full flex flex-col">
                <header className="mb-4">
                  <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm flex items-center gap-1">← 返回概览</button>
                  <h2 className="text-2xl font-bold text-white">交易复盘分析</h2>
                </header>
                <div className="flex-1 min-h-0">
                  <TradeReview />
                </div>
              </div>
            )}

            {view === View.LEARNING && (
              <div className="h-full flex flex-col">
                <header className="mb-4">
                  <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm flex items-center gap-1">← 返回概览</button>
                  <h2 className="text-2xl font-bold text-white">案例盲测中心</h2>
                </header>
                <div className="flex-1 min-h-0">
                  <LearningCenter />
                </div>
              </div>
            )}

            {view === View.RULES && (
              <div className="bg-trade-secondary p-5 md:p-8 rounded-xl border border-slate-700 prose prose-invert max-w-none">
                <h2 className="text-xl md:text-2xl font-bold mb-6">1.8W 交易协议 (V1.0)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 not-prose">
                  <RuleSection title="1. 核心规则" items={['本金：1.8W CNY', '单笔风险：最大 ¥360', '核心周期：D1 趋势 -> H1 区域', '品种：甲醇/TA/螺纹等低保证金品种']} />
                  <RuleSection title="2. 执行五步" items={['D1 战略定方向', 'H1 战术定区域', 'M15 信号定刹车', 'M5 结构定狙击', '风控计算定仓位']} />
                  <RuleSection title="3. 复盘准则" items={['只看过程，不看结果', '违背规则即是失败', '每天只修正一个细节']} className="md:col-span-2" />
                </div>
              </div>
            )}

            {view === View.SETTINGS && <Settings />}

          </div>
        </main>

        {/* Mobile Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-trade-secondary/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-2 py-2 shrink-0 z-50 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
          {navigationItems.map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all ${view === item.view ? 'text-trade-accent' : 'text-slate-400'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.shortLabel}</span>
              {view === item.view && <span className="w-1 h-1 rounded-full bg-trade-accent"></span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-trade-accent text-white font-medium shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const RuleSection = ({ title, items, className }: any) => (
  <div className={`bg-slate-800 p-5 rounded-lg border border-slate-700 ${className}`}>
    <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
    <ul className="space-y-2">
      {items.map((it: string, idx: number) => (
        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
          <span className="text-trade-accent mt-1">•</span>
          {it}
        </li>
      ))}
    </ul>
  </div>
);

export default App;