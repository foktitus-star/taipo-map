'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Marker icon issues in Next.js
const setupDefaultIcon = () => {
  if (typeof window !== 'undefined' && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
};
setupDefaultIcon();

// Custom HTML numbers for POI markers (1, 2, 3...)
const createNumberIcon = (number, isActive) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-xl border-2 transition-all duration-300 ${
        isActive 
          ? 'bg-blue-500 text-white border-white scale-110 ring-4 ring-blue-500/30' 
          : 'bg-[#1e1e30] text-blue-400 border-blue-500/50 hover:bg-blue-900/40 hover:scale-105'
      }">
        ${number}
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
          isActive ? 'bg-blue-500 border-white' : 'bg-[#1e1e30] border-blue-500/50'
        }"></div>
      </div>
    `,
    className: 'custom-route-number-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Help helper for calling OSRM API
const fetchOSRMRoute = async (start, end, profile) => {
  const profileName = profile === 'bike' ? 'bicycle' : profile;
  const urlProfile = profile === 'bike' ? 'routed-bike' : profile === 'foot' ? 'routed-foot' : 'routed-car';
  
  try {
    const response = await fetch(
      `https://routing.openstreetmap.de/${urlProfile}/route/v1/${profileName}/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&overview=full`
    );
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      // OSRM returns coordinates as [lng, lat] -> convert to [lat, lng]
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
  } catch (e) {
    console.error(`OSRM [${profile}] 路由請求失敗:`, e);
  }
  // Fallback to direct straight line on failure
  return [start, end];
};

export default function RouteEditorMap() {
  const [routeName, setRouteName] = useState("大埔社區歷史導賞線");
  const [routeDescription, setRouteDescription] = useState("沿途步行探索林村河、文武廟、太和鐵路博物館等大埔經典文化地標。");
  
  // State: Attractions (POIs)
  const [waypoints, setWaypoints] = useState([]);
  
  // State: Routing profile for each segment (e.g. ['foot', 'bike', 'manual'])
  // Segment i is the path between waypoints[i] and waypoints[i+1]
  const [segmentProfiles, setSegmentProfiles] = useState([]);
  
  // State: Detailed coordinates array for each segment
  // segmentsPath[i] is an array of [lat, lng] coordinates connecting waypoints[i] to waypoints[i+1]
  const [segmentsPath, setSegmentsPath] = useState([]);

  // Editor states
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [globalRoutingMode, setGlobalRoutingMode] = useState('foot'); // 'foot', 'bike', 'car', 'manual'
  const [activeWaypointId, setActiveWaypointId] = useState(null);
  
  // Segment index currently being manually clicked / drawn. Null if none.
  const [activeSegmentIdxForManualDrawing, setActiveSegmentIdxForManualDrawing] = useState(null);
  
  const [basemap, setBasemap] = useState("carto-light"); // 'carto-light', 'osm'
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [activeTab, setActiveTab] = useState("pois"); // 'pois', 'routing'

  // State: Coordinates actively being drawn in manual mode before finishing
  const [activeManualPoints, setActiveManualPoints] = useState([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedRoute = localStorage.getItem('taipo_route_draft_v3');
    if (savedRoute) {
      try {
        const parsed = JSON.parse(savedRoute);
        if (parsed.routeName) setRouteName(parsed.routeName);
        if (parsed.routeDescription) setRouteDescription(parsed.routeDescription);
        if (Array.isArray(parsed.waypoints)) setWaypoints(parsed.waypoints);
        if (Array.isArray(parsed.segmentProfiles)) setSegmentProfiles(parsed.segmentProfiles);
        if (Array.isArray(parsed.segmentsPath)) setSegmentsPath(parsed.segmentsPath);
      } catch (e) {
        console.error("無法載入暫存路線草稿:", e);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    const draft = { routeName, routeDescription, waypoints, segmentProfiles, segmentsPath };
    localStorage.setItem('taipo_route_draft_v3', JSON.stringify(draft));
  }, [routeName, routeDescription, waypoints, segmentProfiles, segmentsPath]);

  // Find active waypoint POI helper
  const activeWaypoint = useMemo(() => {
    return waypoints.find(wp => wp.id === activeWaypointId) || null;
  }, [waypoints, activeWaypointId]);

  // Combine all segments into one continuous LineString coordinate array for export
  const concatenatedFullRoutePath = useMemo(() => {
    if (segmentsPath.length === 0) return [];
    const fullPath = [];
    segmentsPath.forEach((path, idx) => {
      if (idx === 0) {
        fullPath.push(...path);
      } else {
        // Exclude first point of subsequent segments to avoid duplicate junction coordinates
        fullPath.push(...path.slice(1));
      }
    });
    return fullPath;
  }, [segmentsPath]);

  // Recalculates a single segment path when waypoints or profiles change
  const recalculateSegment = async (idx, wps, profiles, currentPaths) => {
    if (idx < 0 || idx >= wps.length - 1) return null;
    const start = wps[idx].latlng;
    const end = wps[idx + 1].latlng;
    const profile = profiles[idx] || 'foot';
    
    if (profile === 'manual') {
      // Keep manual intermediate points if they exist, but update start and end coordinates
      const oldPath = currentPaths[idx];
      if (oldPath && oldPath.length >= 2) {
        const newPath = [...oldPath];
        newPath[0] = start;
        newPath[newPath.length - 1] = end;
        return newPath;
      }
      return [start, end];
    }
    
    return await fetchOSRMRoute(start, end, profile);
  };

  // Click handler on map
  function MapEventsHandler() {
    useMapEvents({
      click(e) {
        // 1. Manual Path intermediate coordinate drawing mode (editing an existing segment)
        if (activeSegmentIdxForManualDrawing !== null) {
          const idx = activeSegmentIdxForManualDrawing;
          if (idx >= segmentsPath.length) return;

          const currentPath = [...segmentsPath[idx]];
          const clickedCoord = [e.latlng.lat, e.latlng.lng];
          
          // Insert click coordinate just before the end POI coordinate
          const endPoint = currentPath[currentPath.length - 1];
          const newPath = [...currentPath.slice(0, -1), clickedCoord, endPoint];
          
          setSegmentsPath(prev => {
            const updated = [...prev];
            updated[idx] = newPath;
            return updated;
          });
          return;
        }

        // 2. Normal POI waypoint addition mode
        if (!isDrawMode) return;
        
        const clickedCoord = [e.latlng.lat, e.latlng.lng];

        // If there are no waypoints yet, the first click MUST create the starting Attraction POI
        if (waypoints.length === 0) {
          const newWp = {
            id: Date.now().toString(),
            latlng: clickedCoord,
            name: "導賞景點 1",
            description: "請填寫此導賞站點的歷史故事、景觀特徵或導覽文字。",
            audioUrl: "",
            imageUrl: ""
          };
          setWaypoints([newWp]);
          setActiveWaypointId(newWp.id);
          return;
        }

        // If in global manual mode and there is a starting waypoint, click appends to active manual polyline
        if (globalRoutingMode === 'manual') {
          setActiveManualPoints(prev => [...prev, clickedCoord]);
          return;
        }

        // Normal snap-to-road waypoint addition for foot/bike/car
        const newWp = {
          id: Date.now().toString(),
          latlng: clickedCoord,
          name: `導賞景點 ${waypoints.length + 1}`,
          description: "請填寫此導賞站點的歷史故事、景觀特徵或導覽文字。",
          audioUrl: "",
          imageUrl: ""
        };

        const prevWaypoint = waypoints[waypoints.length - 1];
        const newWaypoints = [...waypoints, newWp];
        setWaypoints(newWaypoints);
        setActiveWaypointId(newWp.id);

        if (prevWaypoint) {
          const newProfile = globalRoutingMode;
          const newProfiles = [...segmentProfiles, newProfile];
          setSegmentProfiles(newProfiles);

          setIsLoadingRoute(true);
          // Fetch routing in background
          fetchOSRMRoute(prevWaypoint.latlng, newWp.latlng, newProfile).then(path => {
            setSegmentsPath(prev => [...prev, path]);
            setIsLoadingRoute(false);
          });
        }
      }
    });
    return null;
  }

  // Handle POI waypoint drag-and-drop
  const handleWaypointDragEnd = async (id, newLatLng) => {
    const wpIndex = waypoints.findIndex(wp => wp.id === id);
    if (wpIndex === -1) return;

    const updatedWaypoints = waypoints.map(wp => 
      wp.id === id ? { ...wp, latlng: [newLatLng.lat, newLatLng.lng] } : wp
    );
    setWaypoints(updatedWaypoints);

    setIsLoadingRoute(true);
    const updatedPaths = [...segmentsPath];
    
    // Update preceding segment
    if (wpIndex > 0) {
      const newPath = await recalculateSegment(wpIndex - 1, updatedWaypoints, segmentProfiles, updatedPaths);
      if (newPath) updatedPaths[wpIndex - 1] = newPath;
    }
    
    // Update succeeding segment
    if (wpIndex < updatedWaypoints.length - 1) {
      const newPath = await recalculateSegment(wpIndex, updatedWaypoints, segmentProfiles, updatedPaths);
      if (newPath) updatedPaths[wpIndex] = newPath;
    }

    setSegmentsPath(updatedPaths);
    setIsLoadingRoute(false);
  };

  // Update specific field of a waypoint
  const updateWaypoint = (id, field, value) => {
    setWaypoints(prev => prev.map(wp => 
      wp.id === id ? { ...wp, [field]: value } : wp
    ));
  };

  // Finish manual path and create a new waypoint at the end
  const finishManualPath = () => {
    if (activeManualPoints.length === 0) return;
    const lastCoord = activeManualPoints[activeManualPoints.length - 1];
    
    const newWp = {
      id: Date.now().toString(),
      latlng: lastCoord,
      name: `導賞景點 ${waypoints.length + 1}`,
      description: "請填寫此導賞站點的歷史故事、景觀特徵或導覽文字。",
      audioUrl: "",
      imageUrl: ""
    };
    
    const prevWaypoint = waypoints[waypoints.length - 1];
    const newWaypoints = [...waypoints, newWp];
    setWaypoints(newWaypoints);
    setActiveWaypointId(newWp.id);
    
    if (prevWaypoint) {
      setSegmentProfiles(prev => [...prev, 'manual']);
      // Detailed path is start POI -> all clicked manual vertices
      const detailedPath = [prevWaypoint.latlng, ...activeManualPoints];
      setSegmentsPath(prev => [...prev, detailedPath]);
    }
    
    setActiveManualPoints([]);
  };

  // Change specific segment profile
  const handleSegmentProfileChange = async (idx, newProfile) => {
    const updatedProfiles = [...segmentProfiles];
    updatedProfiles[idx] = newProfile;
    setSegmentProfiles(updatedProfiles);

    const start = waypoints[idx].latlng;
    const end = waypoints[idx + 1].latlng;

    setIsLoadingRoute(true);
    let newPath;
    if (newProfile === 'manual') {
      newPath = [start, end]; // Direct straight line initially
      setActiveSegmentIdxForManualDrawing(idx); // Automatically start manual click drawing
    } else {
      newPath = await fetchOSRMRoute(start, end, newProfile);
      if (activeSegmentIdxForManualDrawing === idx) {
        setActiveSegmentIdxForManualDrawing(null);
      }
    }

    setSegmentsPath(prev => {
      const updated = [...prev];
      updated[idx] = newPath;
      return updated;
    });
    setIsLoadingRoute(false);
  };

  // Delete waypoint and restructure segments
  const deleteWaypoint = async (id) => {
    const wpIdx = waypoints.findIndex(wp => wp.id === id);
    if (wpIdx === -1) return;

    const updatedWaypoints = waypoints.filter(wp => wp.id !== id);
    // Auto-rename defaults
    const renamedWaypoints = updatedWaypoints.map((wp, idx) => {
      if (wp.name.startsWith("導賞景點 ")) {
        return { ...wp, name: `導賞景點 ${idx + 1}` };
      }
      return wp;
    });
    
    setWaypoints(renamedWaypoints);
    if (activeWaypointId === id) setActiveWaypointId(null);

    // If no path segments remaining
    if (renamedWaypoints.length < 2) {
      setSegmentProfiles([]);
      setSegmentsPath([]);
      setActiveSegmentIdxForManualDrawing(null);
      return;
    }

    setIsLoadingRoute(true);
    const updatedProfiles = [...segmentProfiles];
    const updatedPaths = [...segmentsPath];

    if (wpIdx === 0) {
      // First waypoint deleted, remove first segment
      updatedProfiles.splice(0, 1);
      updatedPaths.splice(0, 1);
    } else if (wpIdx === waypoints.length - 1) {
      // Last waypoint deleted, remove last segment
      updatedProfiles.splice(wpIdx - 1, 1);
      updatedPaths.splice(wpIdx - 1, 1);
    } else {
      // Intermediate waypoint deleted: merge segment wpIdx-1 and wpIdx
      const mergedProfile = updatedProfiles[wpIdx - 1]; // Keep preceding profile
      updatedProfiles.splice(wpIdx - 1, 2, mergedProfile);
      updatedPaths.splice(wpIdx - 1, 2);

      // Re-calculate the merged path
      let mergedPath;
      if (mergedProfile === 'manual') {
        mergedPath = [renamedWaypoints[wpIdx - 1].latlng, renamedWaypoints[wpIdx].latlng];
      } else {
        mergedPath = await fetchOSRMRoute(
          renamedWaypoints[wpIdx - 1].latlng,
          renamedWaypoints[wpIdx].latlng,
          mergedProfile
        );
      }
      updatedPaths.splice(wpIdx - 1, 0, mergedPath);
    }

    setSegmentProfiles(updatedProfiles);
    setSegmentsPath(updatedPaths);
    setActiveSegmentIdxForManualDrawing(null);
    setIsLoadingRoute(false);
  };

  // Clear all
  const clearAll = () => {
    if (window.confirm("確定要清除整條導賞路線、所有分段路徑與站點資料嗎？")) {
      setWaypoints([]);
      setSegmentProfiles([]);
      setSegmentsPath([]);
      setActiveWaypointId(null);
      setActiveSegmentIdxForManualDrawing(null);
      setActiveManualPoints([]);
      localStorage.removeItem('taipo_route_draft_v3');
    }
  };

  // Export full continuous line path as GeoJSON
  const handleExportGeoJSON = () => {
    if (waypoints.length === 0) return;

    const geojson = {
      type: "FeatureCollection",
      properties: {
        routeName,
        routeDescription,
        waypointsCount: waypoints.length,
        exportedAt: new Date().toISOString()
      },
      features: [
        // 1. Continuous high-fidelity path track (conjoins all routed & manual sections)
        {
          type: "Feature",
          properties: {
            type: "route_track",
            stroke: "#3b82f6",
            "stroke-opacity": 0.85,
            "stroke-width": 4
          },
          geometry: {
            type: "LineString",
            coordinates: concatenatedFullRoutePath.map(coord => [coord[1], coord[0]]) // Lng, Lat
          }
        },
        // 2. Attractions Waypoints Points
        ...waypoints.map((wp, index) => ({
          type: "Feature",
          properties: {
            type: "guided_waypoint",
            sequence: index + 1,
            name: wp.name,
            description: wp.description,
            audioUrl: wp.audioUrl || "",
            imageUrl: wp.imageUrl || ""
          },
          geometry: {
            type: "Point",
            coordinates: [wp.latlng[1], wp.latlng[0]]
          }
        }))
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${routeName.replace(/\s+/g, '_')}_guided_route.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a14] text-slate-100 font-sans overflow-hidden">
      {/* ── Left Administration Dashboard Panel ──────────────────────── */}
      <div className="w-[385px] md:w-[450px] shrink-0 p-6 flex flex-col justify-between border-r border-white/5 bg-[#0f0f1c]/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest leading-none">
                ADMIN PANEL 後台管理端
              </span>
              <h1 className="text-xl font-black text-white mt-1 tracking-wide flex items-center gap-2">
                🚶 智慧路線編輯器
              </h1>
            </div>
            <a 
              href="/" 
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 transition-all font-semibold flex items-center gap-1.5 shadow-md"
            >
              ← 返回前台
            </a>
          </div>

          {/* Route Info Box */}
          <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                導賞路線名稱
              </label>
              <input 
                type="text" 
                value={routeName} 
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="例如：大埔林村河文史路線"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                路線整體簡介
              </label>
              <textarea 
                value={routeDescription} 
                onChange={(e) => setRouteDescription(e.target.value)}
                placeholder="輸入關於整條路線的概括介紹..."
                rows="2"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all resize-none shadow-inner"
              />
            </div>
          </div>

          {/* Setup active drawing profile */}
          <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              預設新路網規劃模式
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'foot', label: '🚶 步行', desc: 'OSM 步行徑' },
                { id: 'bike', label: '🚲 單車', desc: 'OSM 單車徑' },
                { id: 'car', label: '🚗 道路', desc: 'OSM 道路' },
                { id: 'manual', label: '✏️ 手動', desc: '手動畫線' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setGlobalRoutingMode(mode.id)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                    globalRoutingMode === mode.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Manual Path Drawing Card */}
          {activeManualPoints.length > 0 && (
            <div className="bg-pink-950/20 border border-pink-500/30 p-4 rounded-2xl space-y-3 animate-fade-in shadow-xl shadow-pink-950/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-pink-400 font-bold flex items-center gap-1.5 animate-pulse">
                  🔴 正在點擊手動路徑 ({activeManualPoints.length} 個折點)
                </span>
                <button 
                  onClick={() => setActiveManualPoints([])}
                  className="text-[9px] text-slate-400 hover:text-slate-200 transition-colors underline"
                >
                  ❌ 放棄重畫
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                地圖上已繪製出粉紅虛線預覽。您可以連續點擊地圖增加折點，完成後請按下方按鈕以將「最後一個點」設為下一個導賞景點站。
              </p>
              <button
                onClick={finishManualPath}
                className="w-full py-2.5 px-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                🏁 完成手動路徑並新增下一景點
              </button>
            </div>
          )}

          {/* Double Tabs Selector */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => { setActiveTab("pois"); setActiveSegmentIdxForManualDrawing(null); }}
              className={`flex-1 pb-2.5 font-bold text-xs transition-colors border-b-2 text-center ${
                activeTab === "pois" ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📍 景點設定 ({waypoints.length})
            </button>
            <button
              onClick={() => setActiveTab("routing")}
              className={`flex-1 pb-2.5 font-bold text-xs transition-colors border-b-2 text-center ${
                activeTab === "routing" ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🛣️ 交通與分段路徑 ({segmentsPath.length})
            </button>
          </div>

          {/* TAB 1: Attractions POIs */}
          {activeTab === "pois" && (
            <div className="space-y-4">
              {/* Waypoints Sequence List */}
              {waypoints.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      景點順序表
                    </span>
                    <button 
                      onClick={clearAll}
                      className="text-[9px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      ⚠️ 清空整條線
                    </button>
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {waypoints.map((wp, index) => (
                      <div 
                        key={wp.id} 
                        onClick={() => {
                          setActiveWaypointId(wp.id);
                          setIsDrawMode(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          activeWaypointId === wp.id
                            ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold ring-2 ring-blue-500/10'
                            : 'bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-slate-900 border border-white/10 text-[9px] flex items-center justify-center font-black">
                            {index + 1}
                          </span>
                          <span className="truncate">{wp.name}</span>
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWaypoint(wp.id);
                          }}
                          className="text-slate-500 hover:text-red-400 px-1 py-0.5 text-[9px]"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waypoint Details form */}
              {activeWaypoint ? (
                <div className="bg-gradient-to-b from-[#16162a] to-[#121222] p-4 rounded-2xl border border-white/10 shadow-xl space-y-3.5 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="font-black text-white text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {waypoints.findIndex(wp => wp.id === activeWaypoint.id) + 1}
                      </span>
                      景點細節編輯
                    </h3>
                    <button 
                      onClick={() => deleteWaypoint(activeWaypoint.id)}
                      className="text-[9px] bg-red-950/60 hover:bg-red-900/60 border border-red-900/30 text-red-400 px-2 py-1 rounded-lg transition-all"
                    >
                      🗑️ 刪除
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        景點標題
                      </label>
                      <input 
                        type="text" 
                        value={activeWaypoint.name}
                        onChange={(e) => updateWaypoint(activeWaypoint.id, 'name', e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        景點導覽內容
                      </label>
                      <textarea 
                        value={activeWaypoint.description}
                        onChange={(e) => updateWaypoint(activeWaypoint.id, 'description', e.target.value)}
                        rows="3"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 text-[11px] transition-all resize-none leading-relaxed"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          語音導覽 (選填)
                        </label>
                        <input 
                          type="text" 
                          value={activeWaypoint.audioUrl || ""}
                          onChange={(e) => updateWaypoint(activeWaypoint.id, 'audioUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-white text-[9px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          景點圖片 (選填)
                        </label>
                        <input 
                          type="text" 
                          value={activeWaypoint.imageUrl || ""}
                          onChange={(e) => updateWaypoint(activeWaypoint.id, 'imageUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-white text-[9px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  💡 點擊地圖新增景點，<br />或點擊既有標籤以編輯景點導覽文案。
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Routing Settings */}
          {activeTab === "routing" && (
            <div className="space-y-4">
              {segmentsPath.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  🗺️ 路線需要至少 2 個景點，<br />才能產生路徑段落進行交通與繪製規劃！
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    分段交通方式規劃
                  </span>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {segmentsPath.map((path, idx) => {
                      const startName = waypoints[idx]?.name || `第 ${idx + 1} 站`;
                      const endName = waypoints[idx + 1]?.name || `第 ${idx + 2} 站`;
                      const profile = segmentProfiles[idx] || 'foot';
                      const isManualDrawing = activeSegmentIdxForManualDrawing === idx;

                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-2xl border transition-all ${
                            isManualDrawing 
                              ? 'bg-pink-950/20 border-pink-500/50 ring-2 ring-pink-500/10'
                              : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-white truncate max-w-[200px]">
                              {idx + 1}. {startName} ➔ {endName}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              長度: {path.length} 點
                            </span>
                          </div>

                          {/* Options profile for this segment */}
                          <div className="grid grid-cols-4 gap-1 mb-2">
                            {[
                              { id: 'foot', label: '🚶 步行' },
                              { id: 'bike', label: '🚲 單車' },
                              { id: 'car', label: '🚗 道路' },
                              { id: 'manual', label: '✏️ 手動' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => handleSegmentProfileChange(idx, opt.id)}
                                className={`py-1 rounded text-[9px] font-semibold transition-all ${
                                  profile === opt.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {/* Action for Manual Clicking */}
                          {profile === 'manual' && (
                            <div className="mt-2 border-t border-white/5 pt-2 flex items-center justify-between">
                              <span className="text-[9px] text-pink-400 font-semibold flex items-center gap-1">
                                {isManualDrawing ? '🔴 手動加點中...' : '✏️ 手動繪製模式'}
                              </span>
                              <button
                                onClick={() => setActiveSegmentIdxForManualDrawing(isManualDrawing ? null : idx)}
                                className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                                  isManualDrawing
                                    ? 'bg-pink-600 border-pink-500 text-white ring-2 ring-pink-500/20'
                                    : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {isManualDrawing ? '⏹️ 停止加點' : '🖱️ 開始點擊畫線'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {activeSegmentIdxForManualDrawing !== null && (
                    <div className="p-3 bg-pink-950/20 border border-pink-900/50 text-pink-300 rounded-2xl text-[10px] leading-relaxed shadow-md animate-pulse">
                      ✍️ <strong>手動加點啟用中：</strong> 現在點擊地圖上的任何地方，都會直接手動描繪出這條區間的路徑。點擊地圖上的<strong>粉紅色點</strong>可以隨時刪除該輔助路徑點！
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Toggle between Draw POI or just Drag/Edit */}
          <div className="flex gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => { setIsDrawMode(true); setActiveSegmentIdxForManualDrawing(null); }}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] tracking-wide transition-all ${
                isDrawMode && activeSegmentIdxForManualDrawing === null
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🖱️ 點擊新增景點
            </button>
            <button
              onClick={() => setIsDrawMode(false)}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] tracking-wide transition-all ${
                !isDrawMode || activeSegmentIdxForManualDrawing !== null
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🖐️ 拖曳/分段路網設定
            </button>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="pt-6 border-t border-white/5 space-y-3 shrink-0">
          {isLoadingRoute && (
            <div className="flex items-center justify-center gap-2 py-1 text-xs text-blue-400">
              <div className="w-3.5 h-3.5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
              <span>OSM 智慧路網動態規劃中...</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportGeoJSON}
              disabled={waypoints.length === 0}
              className={`py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                waypoints.length === 0
                  ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5 shadow-none'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:shadow-white/5'
              }`}
            >
              <span>💾 匯出 GeoJSON</span>
            </button>
            <button
              onClick={() => {
                alert("即將串接至 Firebase Firestore 資料庫！請閱讀後續指引完成資料庫配置。");
              }}
              disabled={waypoints.length === 0}
              className={`py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                waypoints.length === 0
                  ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5 shadow-none'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/10'
              }`}
            >
              <span>☁️ 儲存至 Firestore</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-500 text-center font-medium font-mono leading-none">
            Taipo Map Routing Admin &copy; 2026
          </div>
        </div>
      </div>

      {/* ── Right Map Canvas Area ─────────────────────────────────────── */}
      <div className="flex-1 h-full w-full relative bg-slate-900">
        {/* Basemap Toggle floating widget */}
        <div className="absolute top-4 left-4 z-[2000] bg-[#0f0f1c]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl flex gap-1 shadow-2xl">
          <button 
            onClick={() => setBasemap("carto-light")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
              basemap === "carto-light"
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            CARTO (簡約灰)
          </button>
          <button 
            onClick={() => setBasemap("osm")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
              basemap === "osm"
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            OSM (街道版)
          </button>
        </div>

        {/* Map Container */}
        <MapContainer 
          center={[22.4508, 114.1712]} // Match MapView.js coordinates
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className="z-10 w-full h-full"
        >
          {/* Chosen Basemap Layer */}
          {basemap === "carto-light" ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          
          {/* Map click and manual draw listener */}
          <MapEventsHandler />

          {/* Render active manual path preview */}
          {activeManualPoints.length > 0 && waypoints.length > 0 && (
            <>
              <Polyline
                positions={[waypoints[waypoints.length - 1].latlng, ...activeManualPoints]}
                color="#f43f5e"
                weight={5}
                opacity={0.8}
                dashArray="6, 8"
              />
              {activeManualPoints.map((coord, pIdx) => (
                <CircleMarker
                  key={`preview_manual_${pIdx}`}
                  center={coord}
                  radius={pIdx === activeManualPoints.length - 1 ? 6 : 4}
                  fillColor="#f43f5e"
                  color="#ffffff"
                  weight={1.5}
                  fillOpacity={0.9}
                >
                  <Popup>
                    <div className="text-[10px] text-slate-800 p-0.5">
                      📌 <strong>預定手動折線點 {pIdx + 1}</strong>
                      {pIdx === activeManualPoints.length - 1 && (
                        <>
                          <br />
                          🏁 <em>此為最後一點，按左側「完成」即可在此設為下一景點站</em>
                        </>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}

          {/* Render individual path segments */}
          {segmentsPath.map((path, idx) => {
            const profile = segmentProfiles[idx] || 'foot';
            const isManualDrawing = activeSegmentIdxForManualDrawing === idx;
            
            // Stylized line colors: Solid blue for snapped paths, dotted pink/purple for manual/actively drawing
            let lineColor = "#2563eb"; // Blue
            let isDotted = false;
            
            if (profile === 'manual') {
              lineColor = "#ec4899"; // Pink
              isDotted = true;
            }
            if (isManualDrawing) {
              lineColor = "#f43f5e"; // Bright Rose for active drawing
              isDotted = true;
            }

            return (
              <React.Fragment key={idx}>
                {/* Visual Path Polyline */}
                <Polyline 
                  positions={path} 
                  color={lineColor}
                  weight={isManualDrawing ? 5 : 4}
                  opacity={0.85}
                  dashArray={isDotted ? "6, 8" : undefined}
                />

                {/* If in manual drawing mode, render small pink circle markers for control coordinates */}
                {profile === 'manual' && activeSegmentIdxForManualDrawing === idx && (
                  path.slice(1, -1).map((coord, pIdx) => (
                    <CircleMarker
                      key={`control_${idx}_${pIdx}`}
                      center={coord}
                      radius={5}
                      fillColor="#ec4899"
                      color="#ffffff"
                      weight={1.5}
                      fillOpacity={0.9}
                      eventHandlers={{
                        click: (e) => {
                          L.DomEvent.stopPropagation(e);
                          // Delete this manual point
                          const newPath = [...path];
                          newPath.splice(pIdx + 1, 1); // pIdx starts at 0 for sliced coords, so actual index is pIdx + 1
                          setSegmentsPath(prev => {
                            const updated = [...prev];
                            updated[idx] = newPath;
                            return updated;
                          });
                        }
                      }}
                    >
                      <Popup>
                        <div className="text-[10px] text-slate-800 p-0.5">
                          📌 <strong>輔助控制點</strong>
                          <br />
                          點擊此點可直接將其從路徑中移除。
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                )}
              </React.Fragment>
            );
          })}

          {/* Attractions (POI) Markers */}
          {waypoints.map((wp, index) => (
            <Marker
              key={wp.id}
              position={wp.latlng}
              icon={createNumberIcon(index + 1, activeWaypointId === wp.id)}
              draggable={true}
              eventHandlers={{
                dragend(e) {
                  const marker = e.target;
                  const newLatLng = marker.getLatLng();
                  handleWaypointDragEnd(wp.id, newLatLng);
                },
                click() {
                  setActiveWaypointId(wp.id);
                  setActiveTab("pois");
                  setIsDrawMode(false); // Focus on drag and settings
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[160px] text-slate-800">
                  <h4 className="font-bold text-sm mb-1 text-slate-900">{wp.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{wp.description}</p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span className="text-[9px] text-slate-400 font-mono">第 {index + 1} 站</span>
                    <button 
                      onClick={() => deleteWaypoint(wp.id)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-semibold"
                    >
                      🗑️ 刪除站點
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
