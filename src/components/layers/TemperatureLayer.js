'use client';
import { useState, useEffect } from 'react';
import { TileLayer } from 'react-leaflet';

export function useTemperatureLayer() {
  const [showTemperature, setShowTemperature] = useState(false);
  const [temperatureUrl, setTemperatureUrl] = useState('');
  const [temperatureLoading, setTemperatureLoading] = useState(false);

  useEffect(() => {
    if (showTemperature && !temperatureUrl && !temperatureLoading) {
      setTemperatureLoading(true);
      fetch('/api/temperature')
        .then(res => res.json())
        .then(data => {
          if (data.urlFormat) {
            setTemperatureUrl(data.urlFormat);
          } else {
            console.error('GEE Error:', data.error);
            alert('地表溫度載入失敗，可能未設定 GEE 金鑰。');
            setShowTemperature(false);
          }
        })
        .catch(err => {
          console.error(err);
          alert('地表溫度載入失敗。');
          setShowTemperature(false);
        })
        .finally(() => {
          setTemperatureLoading(false);
        });
    }
  }, [showTemperature, temperatureUrl, temperatureLoading]);

  return {
    showTemperature,
    setShowTemperature,
    temperatureUrl,
    temperatureLoading
  };
}

export default function TemperatureLayer({ show, url }) {
  if (!show || !url) return null;

  return (
    <TileLayer
      url={url}
      opacity={0.65}
      zIndex={200}
      attribution="Google Earth Engine &amp; Landsat 8"
    />
  );
}

export function TemperatureControl({ show, onChange, loading }) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
    >
      <input
        type="checkbox"
        checked={show}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-[#ef4444] cursor-pointer"
      />
      <span className="text-sm leading-tight text-slate-700">
        🌡️ 地表溫度 (2024夏) {loading && <span className="text-xs text-slate-400">載入中...</span>}
      </span>
    </label>
  );
}
