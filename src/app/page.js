'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Leaflet needs `window` — load only on client side
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-dvh bg-[#0f0f1a]">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm tracking-widest">
          載入地圖中…
        </p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('map'); // 'usage', 'map', 'layers', 'form', 'history'
  const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'

  // Calculate font scale multiplier
  const fontScale = fontSize === 'small' ? 0.875 : fontSize === 'large' ? 1.125 : 1;

  const startTour = () => {
    setActiveTab('map');
    
    setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(15, 15, 26, 0.75)',
        nextBtnText: '下一步 →',
        prevBtnText: '← 上一步',
        doneBtnText: '完成 🎉',
        steps: [
          {
            element: '#map-container-wrapper',
            popover: {
              title: '歡迎使用「大埔地圖導覽」互動地圖！',
              description: '這是一個專為香港大埔設計的互動導覽地圖。您可以在此處探索大埔的環境景緻與歷史變遷。',
              side: 'center',
              align: 'start'
            }
          },
          {
            element: '#sidebar-navigation',
            popover: {
              title: '左側選單導覽',
              description: '使用左側的面板可以在地圖、圖層說明、地景回饋表單與歷史故事之間自由切換，而地圖將會持續在背景為您保留狀態！',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#layer-panel-toggle',
            popover: {
              title: '📍 圖層控制面板',
              description: '地圖右上角有一個圖層控制面板（☰ 按鈕），點擊展開後可以看到所有可用的圖層。引導將自動為您展開面板！',
              side: 'left',
              align: 'start'
            },
            onHighlighted: () => {
              const isExpanded = !!document.getElementById('layer-control-panel-content');
              if (!isExpanded) {
                document.getElementById('layer-panel-toggle')?.click();
              }
            }
          },
          {
            element: '#tour-route-toggles',
            popover: {
              title: '🚶 精選導覽路線',
              description: '地圖會即時載入您從後台發布的特色導覽路線。您可以勾選來顯示或隱藏路線，或點擊地圖上的站點標記查看詳細的地景與歷史故事！',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#tour-open-data-toggles',
            popover: {
              title: '🌳 開放資料與即時溫度',
              description: '包含開放資料（行道樹遮蔭、人行道範圍、都市計畫分區）以及即時溫度分布。勾選後可利用不透明度滑桿（0-100%）自由調整，幫助您進行跨圖層對照！',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#tour-historical-control',
            popover: {
              title: '🕰️ 古今地圖（歷史圖資）',
              description: '提供大埔歷史地圖。透過透明度調整，讓您一鍵穿梭時空，看見大埔市鎮與河道的變遷！',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#tour-satellite-control',
            popover: {
              title: '🛰️ 衛星影像與環境指數',
              description: '提供 Esri 高解析衛星影像，以及 Sentinel-2 的真彩色、植被健康指數（NDVI）與濕度指數，讓您以遙測視角觀察大埔的生態環境。',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#locate-button',
            popover: {
              title: '📍 實地定位功能',
              description: '在戶外踏查時，點擊此按鈕可即時標記您的當前位置，方便與地圖對照。',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#tour-usage-button',
            popover: {
              title: '💡 再次開啟說明',
              description: '如果您日後需要再次閱讀此導覽，隨時可以點擊地圖左下角的「使用方法」按鈕重新啟動！',
              side: 'right',
              align: 'start'
            }
          }
        ]
      });

      driverObj.drive();
    }, 300);
  };

  return (
    <main className="relative w-full h-dvh flex overflow-hidden bg-slate-900" style={{
      '--font-scale': fontScale,
    }}>
      {/* ── Left Sidebar ── */}
      <nav id="sidebar-navigation" className="z-[2000] w-24 md:w-32 bg-slate-900/95 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6 gap-4 shadow-2xl">
        <div className="flex flex-col items-center text-center px-1 mb-4 gap-1.5">
          <h1 className="text-blue-400 text-sm md:text-base font-black tracking-widest leading-tight">
            大埔地圖導覽
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] leading-tight font-semibold">
            大埔社區<br />地圖導覽
          </p>
        </div>
        
        <button 
          onClick={() => setActiveTab('map')}
          className={`group relative p-3 rounded-xl transition-all duration-300 text-sm font-semibold ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          title="地圖 (Map)"
        >
          <span>🗺️ 地圖</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Map</span>
        </button>

        <button 
          onClick={() => setActiveTab('layers')}
          className={`group relative p-3 rounded-xl transition-all duration-300 text-sm font-semibold ${activeTab === 'layers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          title="圖層說明 (Layers)"
        >
          <span>📊 圖層說明</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Layers</span>
        </button>

        <button 
          onClick={() => setActiveTab('form')}
          className={`group relative p-3 rounded-xl transition-all duration-300 text-sm font-semibold ${activeTab === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          title="回饋表單 (Feedback)"
        >
          <span>📝 回饋表單</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Feedback</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`group relative p-3 rounded-xl transition-all duration-300 text-sm font-semibold ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          title="歷史故事 (History)"
        >
          <span>📚 歷史故事</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">History</span>
        </button>

        <div className="mt-auto opacity-20 text-[10px] font-mono -rotate-90 whitespace-nowrap tracking-[0.3em] text-white">TAIPO_MAP</div>

        {/* Font Size Selector */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 w-full px-2">
          <p className="text-[10px] text-white/50 text-center font-semibold">字體大小</p>
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => setFontSize('small')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                fontSize === 'small'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title="小"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`px-2 py-1 rounded text-sm font-semibold transition-all ${
                fontSize === 'medium'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title="中"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-base font-semibold transition-all ${
                fontSize === 'large'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title="大"
            >
              A
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content Area (Map Background) ── */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* The Map stays here at the bottom layer */}
        <div className="absolute inset-0 z-0">
          <MapView onStartTour={startTour} />
        </div>

        {/* ── Overlay: Usage Guide ── */}
        <div 
          className={`absolute inset-0 z-[1000] bg-white transition-all duration-500 ease-in-out ${activeTab === 'usage' ? 'w-1/2' : 'w-0'} overflow-hidden`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900 border-l-8 border-blue-600 pl-6">使用方法</h2>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
                  title="關閉"
                >
                  ✕
                </button>
              </div>
              <p className="text-base text-slate-500 mb-8">了解如何使用大埔地圖導覽</p>
              
              <div className="space-y-6">
                {/* Layer Control Section */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">📍 圖層控制面板</h3>
                  <p className="text-sm text-slate-600 mb-4">地圖右上角有一個圖層控制面板（☰ 按鈕），點擊展開後可以看到所有可用的圖層與導覽路線。</p>
                  
                  <div className="bg-white p-4 rounded-lg mb-4 border border-blue-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3">✓ 如何選擇圖層與路線：</p>
                    <ul className="text-sm text-slate-600 space-y-2 ml-4">
                      <li>• 點擊圖層或路線名稱前的<strong>方形勾選框</strong>來開啟或關閉顯示</li>
                      <li>• 每個圖層都有一個<strong>不透明度滑桿</strong>，可以調整圖層的透明度（0-100%）</li>
                      <li>• 透明度調整可以幫助你比較不同圖層或看到下方的地圖</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3">📂 圖層分類：</p>
                    <ul className="text-sm text-slate-600 space-y-2 ml-4">
                      <li>• <strong>🚶 路線</strong> - 您發布的特色導覽路線</li>
                      <li>• <strong>🕰️ 古今地圖</strong> - 大埔歷史地圖疊加</li>
                      <li>• <strong>🛰️ 衛星影像</strong> - 現代衛星影像與植被、濕度遙測指數</li>
                      <li>• <strong>🌳 開放資料</strong> - 遮蔭與土地使用等規劃分區</li>
                      <li>• <strong>🌡️ 溫度圖層</strong> - 實時微氣候溫度分布</li>
                    </ul>
                  </div>
                </div>

                {/* Routes Section */}
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">🚶 特色導覽路線</h3>
                  <p className="text-sm text-slate-600 mb-4">地圖上顯示了精選的導覽路線，沿途串起多個大埔地景站點。</p>
                  
                  <div className="bg-white p-4 rounded-lg mb-4 border border-green-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3">🔵 導覽路線：</p>
                    <ul className="text-sm text-slate-600 space-y-2 ml-4">
                      <li>• <span className="text-blue-500 font-bold">●</span> 路線：您從後台建立與發布的路線</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3">✓ 與路線互動：</p>
                    <ul className="text-sm text-slate-600 space-y-2 ml-4">
                      <li>• 在圖層控制面板中<strong>勾選路線</strong>來顯示或隱藏軌跡與地標</li>
                      <li>• <strong>點擊路線上的站點</strong>（圓形標記）可以查看該地點的詳細資訊與歷史背景</li>
                      <li>• 詳細資訊包括地標名稱、位置描述、特色地景故事等</li>
                    </ul>
                  </div>
                </div>

                {/* Map Navigation Section */}
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">🗺️ 地圖導航</h3>
                  <p className="text-sm text-slate-600 mb-4">使用以下方式與地圖互動：</p>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <ul className="text-sm text-slate-600 space-y-2 ml-4">
                      <li>• <strong>滑鼠滾輪</strong> - 放大/縮小地圖</li>
                      <li>• <strong>拖曳地圖</strong> - 移動地圖視角</li>
                      <li>• <strong>📍 定位按鈕</strong> - 點擊右上方的定位按鈕取得你的目前位置</li>
                      <li>• <strong>雙擊地圖</strong> - 快速放大到該位置</li>
                    </ul>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">💡 使用提示</h3>
                  <ul className="text-sm text-slate-600 space-y-2 ml-4">
                    <li>• 比較不同時期的歷史地圖，觀察水文系統的變遷</li>
                    <li>• 使用衛星影像與植被指數了解現在的環境狀況</li>
                    <li>• 調整圖層透明度可以同時查看多個圖層的資訊</li>
                    <li>• 點擊路線站點了解每個地點的水文故事</li>
                    <li>• 使用溫度圖層觀察都市熱島效應與水體的冷卻作用</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Overlay: Form ── */}
        <div 
          className={`absolute inset-0 z-[1000] bg-slate-50/95 backdrop-blur-sm transition-transform duration-500 ease-in-out ${activeTab === 'form' ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="max-w-3xl mx-auto h-full overflow-y-auto p-8 md:p-12">
            <header className="mb-12 border-b border-slate-200 pb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">地景調查表單</h2>
              <p className="text-slate-500">協助我們記錄大埔的地景特色與環境觀察。</p>
            </header>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-400 italic text-center py-12">表單內容加載中... (Form components will be placed here)</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('map')}
              className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              返回地圖
            </button>
          </div>
        </div>

        {/* ── Overlay: Layers Info ── */}
        <div 
          className={`absolute inset-0 z-[1000] bg-white transition-transform duration-500 ease-in-out ${activeTab === 'layers' ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="p-8 md:p-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-2 border-l-8 border-blue-600 pl-6">圖層說明</h2>
              <p className="text-slate-500 mb-8">了解地圖上各個圖層的含義與用途</p>
              
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🕰️ 古今地圖 & 歷史文化館</h3>
                  <p className="text-slate-600 mb-3">為了讓您深刻對照大埔的水文與地景變遷，我們整合了以下官方及歷史圖資資源：</p>
                  <ul className="text-sm text-slate-600 space-y-2 ml-4 mb-4">
                    <li>• <strong>地政總署 官方地形圖</strong> - 展示最新、極其精緻的官方現代街道、地標與地形等高線。</li>
                    <li>• <strong>地政總署 官方正射影像 (衛星)</strong> - 高解析度衛星照片，可清晰俯瞰鷺鳥林、林村河口及吐露港海域。</li>
                    <li>• <strong>1902-1903 年新界全圖 (已直接加載！)</strong> - 新界租借初期皇家工程兵團測繪，展現鐵路修建前最原始的大埔谷地、大埔舊墟與沿海天然沙洲。</li>
                    <li>• <strong>1945 年大埔地形圖 (二戰時期/戰前) (已直接加載！)</strong> - 戰後初期地形圖，完美還原二戰前大埔墟火車站（現鐵路博物館）、舊理民府山頭，以及林村河自然蜿蜒與周圍水稻田原始面貌，解決了舊地圖不覆蓋新界的缺失。</li>
                    <li>• <strong>1963 年大埔歷史航照影像 (已直接加載！)</strong> - 填海前夕的官方正射影像，展現尚未人工拉直的河道、元洲仔原始沙洲，與未被填平的吐露港泥灘。</li>
                    <li>• <strong>1974 年大埔地形圖 (開發前夕) (已直接加載！)</strong> - 新市鎮動工前夕的官方地形圖，記錄了新市鎮規劃前的鄉郊聚落分佈與天然海岸線。</li>
                    <li>• <strong>1976 年大埔填海與新市鎮開發航照圖 (已直接加載！)</strong> - 新市鎮動工時期的珍貴黑白空照，清晰展現大埔工業邨填海初成、林村河口人工拉直工程，與早期新市鎮道路網格的誕生。</li>
                    <li>• <strong>1985 年大埔新市鎮地形圖 (開發高峰) (已直接加載！)</strong> - 填海高峰期官方地圖，展現大埔中心、廣福邨、富善邨與工業邨等早期新市鎮住宅與工業規劃佈局的崛起。</li>
                    <li>• <strong>1993 年大埔彩色航照影像 (已直接加載！)</strong> - 九十年代極高清彩色航空正射照片，以彩圖視角重現大埔新市鎮成熟的住宅群與吐露港海岸線。</li>
                    <li>• <strong>1997 年大埔現代地形圖 (成熟完工) (已直接加載！)</strong> - 主權移交時期地形圖，完整記錄現代化大埔新市鎮的規劃完工面貌。</li>
                    <li>• <strong>2014 年歷史空照衛星圖</strong> - 十年前大埔與吐露港的高清衛星空照存檔，可極速載入對比。</li>
                  </ul>
                  
                  {/* Download Cards */}
                  <div className="mt-4 grid grid-cols-1 gap-4 mb-4">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-amber-900">🗺️ 大埔新市鎮歷史演變圖資 (已完美整合 8 大歷史圖層，免手動下載)</p>
                        <p className="text-xs text-amber-700 mt-1">我們已將 1902、1945、1963、1974、1976、1985、1993、1997 的大埔核心歷史圖資完美整合至「古今地圖 (大埔)」，重現新市鎮的填海與市區發展軌跡；並將範圍偏南的「1904 年沙田及鄰近歷史地圖」歸入「其他區域」分類，供您對照跨區水文！點擊右上角 ☰ 即可載入並滑動調整透明度！</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-slate-700"><strong>地景變遷觀察：</strong></p>
                    <p className="text-sm text-slate-600 mt-2">點擊地圖右上角 ☰ 展開「圖層控制」，開啟「官方地形圖」或「官方正射影像」，並調整透明度，您就可以親眼目睹昔日林村河曲折的天然水道如何經整治成為今日開闊的現代排洪河道，以及大埔海岸線的向外推移！</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🛰️ 衛星影像</h3>
                  <p className="text-slate-600 mb-4">實時衛星影像與生態環境指數：</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">• <strong>Esri 衛星影像</strong></p>
                      <p className="text-sm text-slate-600 ml-4">高解析度衛星影像，顯示真實的林村河地表與吐露港海岸景觀。</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">• <strong>Sentinel-2 植被指數 (NDVI)</strong></p>
                      <p className="text-sm text-slate-600 ml-4 mb-2">測量綠化與植被健康度，可用於觀察大埔海濱公園與周邊山巒的生態綠意。</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">• <strong>Sentinel-2 濕度指數 (MOISTURE-INDEX)</strong></p>
                      <p className="text-sm text-slate-600 ml-4 mb-2">顯示土壤與植被的含水量，反映河道與海濱水體周遭的濕度環境。</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🌳 開放資料圖層</h3>
                  <p className="text-slate-600 mb-3">大埔公共基礎設施與綠化分布資料（待導入）：</p>
                  <ul className="text-sm text-slate-600 space-y-2 ml-4">
                    <li>• <strong>行道樹遮蔭</strong> - 大埔各主要道路的林蔭覆蓋</li>
                    <li>• <strong>人行道與單車徑範圍</strong> - 大埔完善的自行車網絡與步道分布</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🌡️ 溫度圖層</h3>
                  <p className="text-slate-600">實時溫度分布，展現大埔新市鎮的高密度住宅與林村河綠帶、海濱水體的微氣候冷卻效應。</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🚶 路線與站點</h3>
                  <p className="text-slate-600 mb-3">精選社區導覽路線：</p>
                  <ul className="text-sm text-slate-600 space-y-2 ml-4">
                    <li>• <strong>歷史導覽路線</strong> - 探索大埔的城市地景與生態軌跡</li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('map')}
                className="mt-12 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                返回地圖
              </button>
            </div>
          </div>
        </div>

        {/* ── Overlay: History ── */}
        <div 
          className={`absolute inset-0 z-[1000] bg-white transition-transform duration-500 ease-in-out ${activeTab === 'history' ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="aspect-video bg-gradient-to-r from-blue-900 to-indigo-950 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="text-center px-6 z-10">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">Taipo Historical Geo-Map</p>
                <h3 className="text-white font-serif font-black text-3xl md:text-5xl leading-tight">大埔歷史地景變遷</h3>
                <p className="text-white/60 text-xs md:text-sm mt-3 max-w-xl mx-auto">從 1904 年的農野墟市，到如今林村河畔的現代綠色市鎮</p>
              </div>
            </div>
            <div className="p-8 md:p-16">
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8 border-l-8 border-blue-600 pl-6">大埔地圖導覽：地景與變遷</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-xl leading-relaxed text-slate-600 mb-6">
                  大埔地處新界東部，擁有豐富的自然景緻與獨特的歷史城鎮脈絡，從傳統的墟市逐漸演變為如今現代化、規劃完善的綠色新市鎮。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-bold mb-3">大埔舊墟與林村河</h3>
                    <p className="text-sm text-slate-500">歷史上的林村河發源自大帽山，流經大埔盆地，是早期居民開拓墟市、灌溉農田、捕魚維生的生命源泉。早在 1904 年的地圖中，此處仍是成片的農田與散落的客家村落，林村河道曲折自然。</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-bold mb-3">現代新市鎮的崛起</h3>
                    <p className="text-sm text-slate-500">隨著大埔新市鎮計畫自 1970 年代開展，林村河被截彎取直並築起石堤防洪，吐露港大面積填海興建了大埔中心與大埔海濱公園，完成了驚人的都市景觀轉變。</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('map')}
                className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                探索地圖
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

