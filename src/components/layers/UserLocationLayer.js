'use client';

import { Circle, CircleMarker, Popup } from 'react-leaflet';

export default function UserLocationLayer({ position, accuracy }) {
  if (!position) return null;

  return (
    <>
      {/* Accuracy Circle */}
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '5, 10'
          }}
        />
      )}

      {/* User Position Marker (Google Maps Style) */}
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 1,
        }}
      >
        <Popup>
          <div className="text-xs font-bold text-blue-900">
            您目前的位置
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}
