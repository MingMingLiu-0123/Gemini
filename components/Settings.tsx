import React, { useRef } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';
import { getTrades, importTrades, clearAllTrades } from '../services/storage';

const Settings: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const trades = getTrades();
    const dataStr = JSON.stringify(trades, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tradelogic_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm(`准备导入 ${json.length} 条交易记录？这将覆盖当前数据。`)) {
            importTrades(json);
            alert('数据导入成功！请刷新页面。');
            window.location.reload();
          }
        } else {
          alert('文件格式错误：不是有效的交易记录列表。');
        }
      } catch (err) {
        alert('文件解析失败，请确保是有效的 JSON 文件。');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = ''; 
  };

  const handleClear = () => {
    if (confirm('⚠️ 警告：此操作将永久删除所有交易记录！此操作不可撤销。\n\n您确定要清空吗？')) {
      if (confirm('请再次确认：真的要删除所有数据吗？')) {
        clearAllTrades();
        alert('数据已清空。');
        window.location.reload();
      }
    }
  };

  return (
    <div className="animate-fadeIn max-w-3xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database size={32} /> 数据管理
        </h2>
        <p className="text-slate-400 mt-2">
            本应用使用浏览器本地存储 (LocalStorage)。为防止数据因清理缓存而丢失，建议定期导出备份。
        </p>
      </div>

      <div className="bg-trade-secondary rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">备份与恢复</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Export */}
                <div className="bg-slate-800 p-6 rounded border border-slate-600 flex flex-col items-center text-center">
                    <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                        <Download size={32} className="text-trade-accent" />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">导出数据</h4>
                    <p className="text-slate-400 text-sm mb-6 flex-1">
                        将您的所有交易记录、复盘笔记下载为 JSON 文件。请妥善保存此文件。
                    </p>
                    <button 
                        onClick={handleExport}
                        className="w-full bg-trade-accent hover:bg-blue-600 text-white py-2 rounded font-medium transition-colors"
                    >
                        下载备份 (.json)
                    </button>
                </div>

                {/* Import */}
                <div className="bg-slate-800 p-6 rounded border border-slate-600 flex flex-col items-center text-center">
                    <div className="bg-green-500/10 p-4 rounded-full mb-4">
                        <Upload size={32} className="text-green-500" />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">导入数据</h4>
                    <p className="text-slate-400 text-sm mb-6 flex-1">
                        上传之前的备份文件以恢复数据。注意：这将覆盖当前的本地记录。
                    </p>
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                    />
                    <button 
                        onClick={handleImportClick}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium transition-colors border border-slate-500"
                    >
                        上传备份文件
                    </button>
                </div>

            </div>
        </div>

        <div className="p-6 bg-red-900/10">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={24} /> 危险区域
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-red-900/20 p-4 rounded border border-red-900/50">
                <div className="text-red-200">
                    <strong>清空所有数据</strong>
                    <p className="text-sm opacity-70">这将删除所有的交易历史和复盘记录。删除后无法找回。</p>
                </div>
                <button 
                    onClick={handleClear}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    <Trash2 size={18} /> 彻底清空
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;