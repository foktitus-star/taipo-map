import { useEffect, useState } from 'react';
import { GeoJSON, CircleMarker, Popup, LayerGroup } from 'react-leaflet';
import proj4 from 'proj4';

// ── proj4 setup (TWD97 to WGS84) ───────────────────────────
proj4.defs(
  'EPSG:3826',
  '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

export default function ComfortLayer({ showTrees, showSidewalks }) {
  const [trees, setTrees] = useState([]);
  const [sidewalks, setSidewalks] = useState(null);

  // Fetch Trees (Layer A)
  useEffect(() => {
    if (!showTrees || trees.length > 0) return;
    fetch('/TaipeiTree_filtered.json')
      .then((res) => res.json())
      .then((data) => {
        // 過濾掉沒有座標、或不在計畫分區範圍內的資料
        const validTrees = data.filter(
          (t) =>
            t &&
            t.lat != null && t.lng != null &&
            t.lat >= 25.005927 && t.lat <= 25.052146 &&
            t.lng >= 121.532936 && t.lng <= 121.610527
        );
        setTrees(validTrees);
      })
      .catch((err) => console.error('Failed to load trees:', err));
  }, [showTrees, trees]);

  // Fetch Sidewalks (Layer B)
  useEffect(() => {
    if (!showSidewalks || sidewalks) return;
    fetch('/api/taipei-sidewalks')
      .then((res) => res.json())
      .then((data) => {
        const filteredFeatures = (data.features || []).filter((f) => {
          if (!f.geometry || !f.geometry.coordinates) return false;

          const getFirstPt = (arr) => (typeof arr[0] === 'number' ? arr : getFirstPt(arr[0]));
          let firstPt = getFirstPt(f.geometry.coordinates);

          let lng = firstPt[0];
          let lat = firstPt[1];

          // 1. 先只針對第一個點做座標轉換，用來判斷是否在範圍內
          if (firstPt[0] > 10000) {
            const wgs84Pt = proj4('EPSG:3826', 'EPSG:4326', [firstPt[0], firstPt[1]]);
            lng = wgs84Pt[0];
            lat = wgs84Pt[1];
          }

          // 2. 判斷是否在行道樹資料的實際範圍內（三個圖層使用同一組界限）
          const inBounds = lat >= 25.013150 && lat <= 25.051617 && lng >= 121.549092 && lng <= 121.592332;

          // 3. 只有「在範圍內」的 Polygon，我們才花費昂貴的 CPU 算力去轉換所有的座標點
          // 這樣可以將 24MB 的 proj4 計算量減少 99%，徹底解決 Vercel 上點擊就當機的問題
          if (inBounds && firstPt[0] > 10000) {
            const projectPoints = (pts) => {
              if (typeof pts[0] === 'number') {
                return proj4('EPSG:3826', 'EPSG:4326', [pts[0], pts[1]]);
              }
              return pts.map(projectPoints);
            };
            f.geometry.coordinates = projectPoints(f.geometry.coordinates);
          }
          
          return inBounds;
        });
        setSidewalks({ ...data, features: filteredFeatures });
      })
      .catch((err) => console.error('Failed to load sidewalks:', err));
  }, [showSidewalks, sidewalks]);

  return (
    <LayerGroup>
      {showSidewalks && sidewalks && (
        <GeoJSON
          data={sidewalks}
          style={{ color: '#60a5fa', weight: 3, opacity: 0.5 }}
        />
      )}

      {showTrees &&
        trees.map((t, i) => (
          <CircleMarker
            key={t.TreeID || `tree-${i}`}
            center={[t.lat, t.lng]}
            radius={3}
            pathOptions={{ stroke: false, fillColor: '#30F243', fillOpacity: 0.25 }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[120px]">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">
                  🌳 {t.TreeType || '未知樹種'}
                </h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>樹高：<span className="font-medium text-slate-700">{t.TreeHeight ? `${t.TreeHeight} m` : '無資料'}</span></p>
                  <p>胸徑：<span className="font-medium text-slate-700">{t.Diameter ? `${t.Diameter} cm` : '無資料'}</span></p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </LayerGroup>
  );
}
