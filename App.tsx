import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, BookOpen, Settings } from 'lucide-react';
import StepWizard from './components/StepWizard';
import Dashboard from './components/Dashboard';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRADE = 'NEW_TRADE',
  RULES = 'RULES'
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
          <div className="text-xs text-slate-500 mt-1">Consistency Trainer</div>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavButton 
            active={view === View.DASHBOARD} 
            onClick={() => setView(View.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={view === View.NEW_TRADE} 
            onClick={() => setView(View.NEW_TRADE)} 
            icon={<PlusCircle size={20} />} 
            label="New Trade Wizard" 
          />
          <NavButton 
            active={view === View.RULES} 
            onClick={() => setView(View.RULES)} 
            icon={<BookOpen size={20} />} 
            label="Strategy Manual" 
          />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 text-slate-500 text-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             System Active
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-trade-primary p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {view === View.DASHBOARD && (
            <>
              <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Trading Cockpit</h2>
                    <p className="text-slate-400 mt-2">Welcome back. Remember: Survival first, Profit second.</p>
                </div>
                <button 
                    onClick={() => setView(View.NEW_TRADE)}
                    className="bg-trade-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    <PlusCircle size={18} /> Start New Trade
                </button>
              </div>
              <Dashboard />
            </>
          )}

          {view === View.NEW_TRADE && (
             <div className="animate-slideIn">
                <div className="mb-6">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-slate-500 hover:text-white mb-2 text-sm">← Back to Dashboard</button>
                    <h2 className="text-3xl font-bold text-white">New Trade Execution</h2>
                </div>
                <StepWizard onComplete={() => setView(View.DASHBOARD)} />
             </div>
          )}

          {view === View.RULES && (
            <div className="bg-trade-secondary p-8 rounded-lg border border-slate-700 prose prose-invert max-w-none">
                <h2>The 1.8W System Protocol</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    <div className="bg-slate-800 p-6 rounded border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">1. Core Rules</h3>
                        <ul className="list-disc pl-5 text-slate-300 space-y-2">
                            <li><strong>Capital:</strong> ~1.8W CNY</li>
                            <li><strong>Risk Per Trade:</strong> Max 2-3% (¥360)</li>
                            <li><strong>Philosophy:</strong> Trend Follow (D1) + Reversal (H1)</li>
                            <li><strong>Assets:</strong> Low Margin (Methanol, PTA, PVC, Rebar)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-800 p-6 rounded border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">2. The 5 Steps</h3>
                        <ol className="list-decimal pl-5 text-slate-300 space-y-2">
                            <li><strong>D1 Trend:</strong> Check MA60 & Dow Structure.</li>
                            <li><strong>H1 Zone:</strong> Find Support/Resistance. Wait.</li>
                            <li><strong>30m/15m Signal:</strong> Pinbar/Engulfing.</li>
                            <li><strong>5m Trigger:</strong> Breakout entry.</li>
                            <li><strong>Execute:</strong> Calculate lot size strictly.</li>
                        </ol>
                    </div>
                </div>
            </div>
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