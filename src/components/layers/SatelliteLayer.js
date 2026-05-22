import { TileLayer, WMSTileLayer } from 'react-leaflet';

/**
 * Satellite imagery layer
 * Supports both Esri World Imagery and Sentinel-2
 * Limited to Hong Kong area for better performance
 */

// Sentinel Hub Instance ID
const SENTINEL_HUB_INSTANCE_ID = '520c8ebf-c059-4faf-92ec-bef0b2420fd7';

export const SATELLITE_MAPS = [
  {
    id: 'esri-satellite',
    label: 'Esri 衛星影像',
    emoji: '🛰️',
    type: 'xyz',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    description: 'Esri 高解析度衛星影像',
  },
  {
    id: 'sentinel2-natural',
    label: 'Sentinel-2 真彩色',
    emoji: '🛰️',
    type: 'wms',
    url: 'https://sh.dataspace.copernicus.eu/ogc/wms/' + SENTINEL_HUB_INSTANCE_ID,
    layers: 'NATURAL-COLOR',
    description: 'Sentinel-2 真彩色衛星影像',
  },
  {
    id: 'sentinel2-ndvi',
    label: 'Sentinel-2 植被指數',
    emoji: '🌱',
    type: 'wms',
    url: 'https://sh.dataspace.copernicus.eu/ogc/wms/' + SENTINEL_HUB_INSTANCE_ID,
    layers: 'NDVI',
    description: 'Sentinel-2 植被健康度指數',
  },
  {
    id: 'sentinel2-moisture',
    label: 'Sentinel-2 濕度指數',
    emoji: '💧',
    type: 'wms',
    url: 'https://sh.dataspace.copernicus.eu/ogc/wms/' + SENTINEL_HUB_INSTANCE_ID,
    layers: 'MOISTURE-INDEX',
    description: 'Sentinel-2 土壤與植被濕度指數',
  },
];

/**
 * Renders satellite imagery layer
 * Supports both XYZ tiles (Esri) and WMS (Sentinel-2)
 * Limited to Hong Kong area for better performance
 * @param {{ activeId: string|null, opacity: number }} props
 */
export default function SatelliteLayer({ activeId, opacity }) {
  if (!activeId) {
    return null;
  }

  const map = SATELLITE_MAPS.find((m) => m.id === activeId);
  if (!map) return null;

  const bounds = [
    [22.15, 113.80],  // Southwest corner (HK area)
    [22.60, 114.40],  // Northeast corner (HK area)
  ];

  // For XYZ tile layers (Esri)
  if (map.type === 'xyz') {
    return (
      <TileLayer
        key={map.id}
        url={map.url}
        attribution='Tiles &copy; Esri'
        opacity={opacity}
        minZoom={10}
        maxZoom={18}
        bounds={bounds}
      />
    );
  }

  // For WMS layers (Sentinel-2)
  if (map.type === 'wms') {
    return (
      <WMSTileLayer
        key={map.id}
        url={map.url}
        layers={map.layers}
        format="image/png"
        transparent={true}
        opacity={opacity}
        minZoom={10}
        maxZoom={18}
        bounds={bounds}
        attribution='Sentinel-2 © Copernicus'
        params={{
          time: '2024-01-01/2025-12-31',
          maxcc: 10,
          showlogo: false,
        }}
      />
    );
  }

  return null;
}

/**
 * Renders the UI control panel section for satellite layers
 */
export function SatelliteControl({ activeSatellite, toggleSatellite, satelliteOpacities, onOpacityChange }) {
  return (
    <div id="tour-satellite-control" className="space-y-1 mb-4 pt-3 border-t border-slate-200">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
        🛰️ 衛星影像
      </p>
      {SATELLITE_MAPS.map((sm) => (
        <div key={sm.id} className="flex flex-col mb-1">
          <label
            className="flex items-center gap-3 cursor-pointer
                       hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            title={sm.description}
          >
            <input
              type="checkbox"
              checked={activeSatellite === sm.id}
              onChange={() => toggleSatellite(sm.id)}
              className="w-5 h-5 rounded cursor-pointer"
              style={{ accentColor: '#0ea5e9' }}
            />
            <span className="text-sm leading-tight text-slate-700">{sm.label}</span>
          </label>

          {/* Opacity Slider */}
          <div className={`
            flex items-center gap-2 px-10 transition-all duration-300 ease-in-out
            ${activeSatellite === sm.id ? 'h-6 opacity-100 mt-0.5' : 'h-0 opacity-0 overflow-hidden'}
          `}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={satelliteOpacities[sm.id] || 0.7}
              onChange={(e) => onOpacityChange(sm.id, parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right">
              {Math.round((satelliteOpacities[sm.id] || 0.7) * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
