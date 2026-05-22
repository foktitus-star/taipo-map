import { TileLayer, ImageOverlay } from 'react-leaflet';

// ── Historical basemap definitions ─────────────────────────
export const HISTORICAL_MAPS = [
  {
    id: 'landsd_topo',
    label: '地政總署 官方地形圖',
    emoji: '🗺️',
    type: 'tile',
    url: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/wgs84/{z}/{x}/{y}.png',
    color: '#0284c7',
    attribution: '地圖圖資 © <a href="https://www.landsd.gov.hk" target="_blank">香港地政總署</a>',
    category: 'taipo',
  },
  {
    id: 'landsd_satellite',
    label: '地政總署 官方正射影像',
    emoji: '🛰️',
    type: 'tile',
    url: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/imagery/wgs84/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#15803d',
    attribution: '地圖圖資 © <a href="https://www.landsd.gov.hk" target="_blank">香港地政總署</a>',
    category: 'taipo',
  },
  {
    id: 'wayback_2014',
    label: '2014 年歷史空照衛星圖',
    emoji: '🛰️',
    type: 'tile',
    url: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/11964/{z}/{y}/{x}',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#854d0e',
    attribution: '歷史衛星圖資 © <a href="https://www.esri.com" target="_blank">Esri Wayback</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1902',
    label: '1902-1903 年新界全圖',
    emoji: '📜',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1904.1/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#ca8a04',
    attribution: '歷史地圖 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1903-1904)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1945',
    label: '1945 年大埔地形圖 (二戰時期/戰前)',
    emoji: '📜',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1945/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#d97706',
    attribution: '歷史地形圖 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1945)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1963',
    label: '1963 年大埔歷史航照影像',
    emoji: '📷',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1963.2/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#4b5563',
    attribution: '歷史正射航照 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1963)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1974',
    label: '1974 年大埔地形圖 (開發前夕)',
    emoji: '📜',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1974.1/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#0ea5e9',
    attribution: '歷史地形圖 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1974)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1976',
    label: '1976 年大埔填海與新市鎮開發航照圖',
    emoji: '📷',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1976.3/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#16a34a',
    attribution: '歷史正射航照 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1976)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1985',
    label: '1985 年大埔新市鎮地形圖 (開發高峰)',
    emoji: '📜',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1985.1/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#a855f7',
    attribution: '歷史地形圖 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1985)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1993',
    label: '1993 年大埔彩色航照影像',
    emoji: '📷',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1993/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#e11d48',
    attribution: '歷史正射航照 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1993)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1997',
    label: '1997 年大埔現代地形圖 (成熟完工)',
    emoji: '📜',
    type: 'tile',
    url: 'https://www.hkmaps.hk/maps/1997/{z}/{x}/{y}.png',
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#06b6d4',
    attribution: '歷史地形圖 © <a href="https://hkmaps.hk" target="_blank">hkmaps.hk (1997)</a>',
    category: 'taipo',
  },
  {
    id: 'taipo_1904',
    label: '1904 年沙田及鄰近歷史地圖',
    emoji: '🗺️',
    type: 'overlay',
    url: '/taipo_1904.jpg',
    bounds: [
      [22.36539972230586, 114.14400709130024],
      [22.419039085061613, 114.20938833657097]
    ],
    labelUrl: 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/tc/wgs84/{z}/{x}/{y}.png',
    color: '#b45309',
    attribution: '歷史地圖 © <a href="https://www.landsd.gov.hk" target="_blank">香港地政總署 (1904)</a>',
    category: 'other',
  },
];

/**
 * Renders the selected historical raster tile layer or ImageOverlay.
 * Placed inside MapContainer *after* the base CartoDB tile but *before*
 * all data layers (routes, trees, zoning) so it acts as a historical basemap.
 *
 * @param {{ activeId: string|null, opacity: number }} props
 *   activeId — the id of the chosen historical map, or null for none.
 *   opacity — the opacity of the historical map (0 to 1).
 */
export default function HistoricalLayer({ activeId, opacity }) {
  const map = HISTORICAL_MAPS.find((m) => m.id === activeId);
  if (!map) return null;

  if (map.type === 'overlay') {
    return (
      <>
        <ImageOverlay
          key={map.id}
          url={map.url}
          bounds={map.bounds}
          opacity={opacity}
          zIndex={150}
        />
        {map.labelUrl && (
          <TileLayer
            key={`${map.id}-labels`}
            url={map.labelUrl}
            tileSize={256}
            opacity={opacity}
            attribution={map.attribution}
            zIndex={160}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TileLayer
        key={map.id}          // key forces remount when switching maps
        url={map.url}
        tileSize={256}
        opacity={opacity}
        attribution={map.attribution}
        maxNativeZoom={18}
        minZoom={10}
        zIndex={150}
      />
      {map.labelUrl && (
        <TileLayer
          key={`${map.id}-labels`}
          url={map.labelUrl}
          tileSize={256}
          opacity={opacity}
          attribution={map.attribution}
          zIndex={160}
        />
      )}
    </>
  );
}

/**
 * Renders the UI control panel section for historical maps.
 * Intended to be placed in the control panel outside the MapContainer.
 */
export function HistoricalControl({ activeHistory, toggleHistory, historyOpacities, onOpacityChange }) {
  const taipoMaps = HISTORICAL_MAPS.filter((m) => m.category !== 'other');
  const otherMaps = HISTORICAL_MAPS.filter((m) => m.category === 'other');

  const renderMapItem = (hm) => (
    <div key={hm.id} className="flex flex-col mb-1">
      <label
        className="flex items-center gap-3 cursor-pointer
                   hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
      >
        <input
          type="checkbox"
          checked={activeHistory === hm.id}
          onChange={() => toggleHistory(hm.id)}
          className="w-5 h-5 rounded cursor-pointer"
          style={{ accentColor: hm.color }}
        />
        <span
          className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/50"
          style={{ background: hm.color }}
        />
        <span className="text-sm leading-tight text-slate-700">{hm.label}</span>
      </label>
      
      {/* Opacity Slider - Visible when active or with reduced height when inactive */}
      <div className={`
        flex items-center gap-2 px-10 transition-all duration-300 ease-in-out
        ${activeHistory === hm.id ? 'h-6 opacity-100 mt-0.5' : 'h-0 opacity-0 overflow-hidden'}
      `}>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={historyOpacities[hm.id] || 0.7} 
          onChange={(e) => onOpacityChange(hm.id, parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right">
          {Math.round((historyOpacities[hm.id] || 0.7) * 100)}%
        </span>
      </div>
    </div>
  );

  return (
    <div id="tour-historical-control" className="space-y-1 mb-4 pt-3 border-t border-slate-200">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
        🕰️ 古今地圖 (大埔)
      </p>
      {taipoMaps.map(renderMapItem)}

      {otherMaps.length > 0 && (
        <>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mt-4 mb-2">
            🗺️ 其他區域
          </p>
          {otherMaps.map(renderMapItem)}
        </>
      )}
    </div>
  );
}

