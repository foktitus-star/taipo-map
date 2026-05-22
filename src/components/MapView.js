'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routes } from '@/data/routeData';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RouteLayer from './layers/RouteLayer';
import UserLocationLayer from './layers/UserLocationLayer';
import HistoricalLayer, { HistoricalControl, HISTORICAL_MAPS } from './layers/HistoricalLayer';
import DataSourceControl from './layers/DataSourceControl';
import NodeFeedbackForm from './forms/NodeFeedbackForm';

// Fix default icon issue in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
import SatelliteLayer, { SatelliteControl, SATELLITE_MAPS } from './layers/SatelliteLayer';


// ── helpers ────────────────────────────────────────────────
/** Build a full polyline path from station coords + segment waypoints */
function buildPolyline(route) {
  const stationMap = {};
  route.stations.forEach((s) => {
    stationMap[s.id] = [s.lat, s.lng];
  });

  // If no segments data, fall back to station order
  if (!route.segments || route.segments.length === 0) {
    return route.stations.map((s) => [s.lat, s.lng]);
  }

  const lines = [];
  route.segments.forEach((seg) => {
    const from = stationMap[seg.from];
    const to = stationMap[seg.to];
    if (!from || !to) return;
    const pts = [from];
    if (seg.waypoints) {
      seg.waypoints.forEach((wp) => pts.push([wp.lat, wp.lng]));
    }
    pts.push(to);
    lines.push(pts);
  });
  return lines;
}

// ── Route labels for the control panel ─────────────────────
const ROUTE_LABELS = [

];

// ── FitBounds helper component ─────────────────────────────
function FitBoundsOnLoad({ allRoutes }) {
  const map = useMap();
  useEffect(() => {
    // Gather all station coords
    const allCoords = allRoutes.flatMap((r) =>
      r.stations.map((s) => [s.lat, s.lng])
    );
    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [30, 30] });
    }
  }, [map, allRoutes]);
  return null;
}

// ── Zoom/Pan to fit bounds when historical map or overlay is selected ───────────────────
function FitBoundsOnHistoryChange({ activeId }) {
  const map = useMap();
  useEffect(() => {
    if (!activeId) return;
    const historyMap = HISTORICAL_MAPS.find((m) => m.id === activeId);
    if (historyMap && historyMap.type === 'overlay' && historyMap.bounds) {
      map.fitBounds(historyMap.bounds, { padding: [20, 20], animate: true, duration: 1.5 });
    }
  }, [activeId, map]);
  return null;
}

// ── Map Click Interaction for Free Marker ────────────────────
function AddMarkerInteraction({ isAddMode, onAddMarker }) {
  useMapEvents({
    click(e) {
      if (isAddMode) {
        onAddMarker(e.latlng);
      }
    }
  });
  return null;
}

// ── Main map component ─────────────────────────────────────
export default function MapView({ onStartTour }) {
  const [allRoutes, setAllRoutes] = useState(routes);
  const [visibility, setVisibility] = useState([]);
  const [expandPanel, setExpandPanel] = useState(false);

  // Fetch dynamic routes from Firestore
  useEffect(() => {
    const fetchPublishedRoutes = async () => {
      try {
        const q = query(collection(db, "guided_routes"), where("published", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedRoutes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.stations && data.stations.length > 0) {
            fetchedRoutes.push({
              id: data.id || doc.id,
              name: data.name || "未命名路線",
              subtitle: data.subtitle || "",
              color: data.color || "#2c704d",
              colorDark: data.colorDark || "#1D4ED8",
              startStation: data.startStation || "",
              stationCount: data.stationCount || data.stations.length,
              stations: data.stations,
              segments: data.segments || []
            });
          }
        });

        if (fetchedRoutes.length > 0) {
          setAllRoutes((prev) => {
            // Keep original static routes, append unique dynamic ones
            const existingIds = new Set(prev.map(r => r.id));
            const uniqueFetched = fetchedRoutes.filter(r => !existingIds.has(r.id));
            return [...prev, ...uniqueFetched];
          });
        }
      } catch (err) {
        console.error("無法載入 Firestore 發布的路線:", err);
      }
    };

    fetchPublishedRoutes();
  }, []);

  // Update visibility when allRoutes updates
  useEffect(() => {
    setVisibility((prev) => {
      const next = allRoutes.map((r, idx) => prev[idx] !== undefined ? prev[idx] : true);
      return next;
    });
  }, [allRoutes]);



  // Historical basemap state (null = none active)
  const [activeHistory, setActiveHistory] = useState(null);
  const [historyOpacities, setHistoryOpacities] = useState(
    HISTORICAL_MAPS.reduce((acc, hm) => ({ ...acc, [hm.id]: 0.7 }), {})
  );

  // Satellite layer state
  const [activeSatellite, setActiveSatellite] = useState(null);
  const [satelliteOpacities, setSatelliteOpacities] = useState(
    SATELLITE_MAPS.reduce((acc, sm) => ({ ...acc, [sm.id]: 0.7 }), {})
  );

  const handleHistoryOpacityChange = (id, value) => {
    setHistoryOpacities(prev => ({ ...prev, [id]: value }));
  };

  const handleSatelliteOpacityChange = (id, value) => {
    setSatelliteOpacities(prev => ({ ...prev, [id]: value }));
  };



  const toggleHistory = (id) =>
    setActiveHistory((prev) => (prev === id ? null : id));

  const toggleSatellite = (id) =>
    setActiveSatellite((prev) => (prev === id ? null : id));

  // Geolocation state
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locating, setLocating] = useState(false);

  // Add Free Marker state
  const [isAddMarkerMode, setIsAddMarkerMode] = useState(false);
  const [newMarkerPos, setNewMarkerPos] = useState(null);

  const handleAddMarker = (latlng) => {
    setNewMarkerPos(latlng);
    setIsAddMarkerMode(false); // Disable mode after placing the marker
  };

  const polylines = useMemo(
    () => allRoutes.map((r) => buildPolyline(r)),
    [allRoutes]
  );

  const toggleRoute = (idx) => {
    setVisibility((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const allOn = () => setVisibility(allRoutes.map(() => true));
  const allOff = () => setVisibility(allRoutes.map(() => false));

  // Geolocation handler
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('您的瀏覽器不支援定位功能');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPos([latitude, longitude]);
        setAccuracy(accuracy);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          alert('請允許瀏覽器存取您的位置');
        } else {
          alert('無法取得您的位置，請稍後再試');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div id="map-container-wrapper" className="relative w-full h-full">
      {/* ── Map ─────────────────────────────────────────── */}
      <MapContainer
        center={[22.4508, 114.1712]}
        zoom={15}
        className="w-full h-full z-0"
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          className="map-tiles-tinted"
        />
        <FitBoundsOnLoad allRoutes={allRoutes} />
        <FitBoundsOnHistoryChange activeId={activeHistory} />
        <MapFlyTo center={userPos} />
        <AddMarkerInteraction isAddMode={isAddMarkerMode} onAddMarker={handleAddMarker} />

        {/* ── Historical basemap (below all data layers) ── */}
        <HistoricalLayer
          activeId={activeHistory}
          opacity={activeHistory ? historyOpacities[activeHistory] : 0.7}
        />

        {/* ── Satellite layer ── */}
        <SatelliteLayer
          activeId={activeSatellite}
          opacity={activeSatellite ? satelliteOpacities[activeSatellite] : 0.7}
        />

        {/* ── Modular Layers ── */}


        {allRoutes.map((route, ri) =>
          visibility[ri] ? (
            <RouteLayer
              key={route.id}
              route={route}
              polylines={polylines[ri]}
            />
          ) : null
        )}

        <UserLocationLayer position={userPos} accuracy={accuracy} />

        {/* Free Marker Form */}
        {newMarkerPos && (
          <Marker position={newMarkerPos}>
            <Popup
              className="feedback-popup"
              minWidth={300}
              maxWidth={400}
              eventHandlers={{
                remove: () => setNewMarkerPos(null) // Clear state when closed
              }}
            >
              <NodeFeedbackForm
                lat={newMarkerPos.lat}
                lng={newMarkerPos.lng}
                onClose={() => setNewMarkerPos(null)}
              />
            </Popup>
          </Marker>
        )}

      </MapContainer>

      {/* ── Layer control panel (top-right) ─────────────── */}
      <div
        className={`
          absolute top-3 right-3 z-[1000]
          bg-white/95 backdrop-blur-md
          border border-primary-900/10 rounded-2xl
          shadow-xl text-slate-800
          transition-all duration-300 ease-in-out
          ${expandPanel ? 'w-72 p-5' : 'w-12 h-12 p-0'}
          max-h-[calc(100dvh-24px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        `}
      >
        {/* Toggle button */}
        <button
          id="layer-panel-toggle"
          onClick={() => setExpandPanel(!expandPanel)}
          className={`
            flex items-center justify-center
            ${expandPanel ? 'w-full mb-3' : 'w-12 h-12'}
            rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-900
            transition-colors duration-200
            text-lg cursor-pointer font-bold
          `}
          aria-label="切換圖層面板"
        >
          {expandPanel ? '✕ 關閉' : '☰'}
        </button>

        {expandPanel && (
          <div id="layer-control-panel-content" className="w-full">
            <h3 className="text-base font-bold mb-3 tracking-wide text-primary-900">
              圖層控制
            </h3>

            {/* Route toggles */}
            <div id="tour-route-toggles" className="w-full">
              <div className="space-y-2 mb-4">
                {allRoutes.map((route, idx) => (
                  <label
                    key={route.id}
                    className="flex items-center gap-3 cursor-pointer
                               hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={visibility[idx]}
                      onChange={() => toggleRoute(idx)}
                      className="w-5 h-5 rounded accent-current cursor-pointer"
                      style={{ accentColor: route.color }}
                    />
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: route.color }}
                    />
                    <span className="text-sm leading-tight">
                      {ROUTE_LABELS[idx]?.label || route.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Quick buttons for routes */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={allOn}
                  className="flex-1 text-xs py-2 rounded-lg font-medium
                             bg-primary-50 hover:bg-primary-100 text-primary-800
                             transition-colors cursor-pointer"
                >
                  全選
                </button>
                <button
                  onClick={allOff}
                  className="flex-1 text-xs py-2 rounded-lg font-medium
                             bg-slate-100 hover:bg-slate-200 text-slate-700
                             transition-colors cursor-pointer"
                >
                  全清
                </button>
              </div>
            </div>

            {/* Historical maps selector */}
            <HistoricalControl
              activeHistory={activeHistory}
              toggleHistory={toggleHistory}
              historyOpacities={historyOpacities}
              onOpacityChange={handleHistoryOpacityChange}
            />

            {/* Satellite layers selector */}
            <SatelliteControl
              activeSatellite={activeSatellite}
              toggleSatellite={toggleSatellite}
              satelliteOpacities={satelliteOpacities}
              onOpacityChange={handleSatelliteOpacityChange}
            />

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                共 {allRoutes.reduce((s, r) => s + r.stations.length, 0)} 個站點
                ・點擊站點查看詳情
              </p>
            </div>

            {/* Free Marker Toggle */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsAddMarkerMode(!isAddMarkerMode);
                  if (newMarkerPos) setNewMarkerPos(null);
                }}
                className={`
                  w-full py-2.5 rounded-lg font-bold text-sm transition-all
                  flex items-center justify-center gap-2
                  ${isAddMarkerMode
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}
                `}
              >
                {isAddMarkerMode ? (
                  <><span>🎯</span> 點擊地圖新增標記 (點此取消)</>
                ) : (
                  <><span>📍</span> 自由新增地景標記</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global overlay cursor hint for add mode */}
      {isAddMarkerMode && (
        <div className="absolute inset-0 z-[999] pointer-events-none cursor-crosshair"></div>
      )}

      {/* ── Locate Button (Below panel toggle or bottom right) ── */}
      <button
        id="locate-button"
        onClick={handleLocate}
        disabled={locating}
        className={`
          absolute top-[72px] right-3 z-[1000]
          w-12 h-12 rounded-2xl
          bg-white/95 backdrop-blur-md
          border border-primary-900/10 shadow-lg
          flex items-center justify-center
          text-2xl transition-all duration-200
          hover:bg-primary-50 active:scale-95
          ${locating ? 'animate-pulse text-primary-400' : 'text-primary-900'}
        `}
        title="取得目前位置"
      >
        {locating ? '⏳' : '📍'}
      </button>

      {/* ── Usage Guide Button overlay (bottom-left) ── */}
      <div
        className="
          absolute bottom-4 left-4 z-[1000]
        "
      >
        <button
          id="tour-usage-button"
          onClick={onStartTour}
          className="
            flex items-center justify-center gap-2
            px-4 py-3 rounded-2xl text-xs font-bold
            bg-primary-600 hover:bg-primary-700 text-white
            shadow-xl shadow-primary-500/25 border border-primary-500/20
            transition-all duration-300 active:scale-95 cursor-pointer
          "
          title="使用方法 (How to Use)"
        >
          <span>❓ 使用方法</span>
        </button>
      </div>

      {/* ── Data Source Control (bottom-right) ── */}
      <DataSourceControl />
    </div>
  );
}

// ── Internal Helper: MapFlyTo ───────────────────────────────
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}


