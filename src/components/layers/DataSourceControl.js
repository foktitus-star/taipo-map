import { useState } from 'react';

export default function DataSourceControl() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="absolute bottom-[68px] left-4 z-[1000] flex flex-col items-start"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* 展開的氣泡內容 */}
      <div 
        className={`
          bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-xl overflow-hidden
          transition-all duration-300 ease-out origin-bottom-left
          ${isExpanded ? 'max-h-48 opacity-100 scale-100 mb-2' : 'max-h-0 opacity-0 scale-95 mb-0'}
        `}
      >
        <div className="p-3.5 text-xs text-slate-600 whitespace-nowrap space-y-2 font-medium">
          <p className="font-bold text-slate-800 border-b border-slate-200/80 pb-1.5 mb-1.5">
            資料來源與鳴謝
          </p>
          <p>• 開放街圖 (OpenStreetMap)</p>
          <p>• 歷史地圖與衛星遙測影像</p>
          <p>• 在地田野調查與口述歷史</p>
        </div>
      </div>
      
      {/* 預設顯示的小按鈕 */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-md rounded-full px-3.5 py-1.5 text-[11px] font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1.5">
        <span>資料來源</span>
        <span className="text-sm">ℹ️</span>
      </div>
    </div>
  );
}
