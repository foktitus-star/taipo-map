import { useState } from 'react';
import { BASE_URL } from '@/data/routeData';
import NodeFeedbackForm from '../forms/NodeFeedbackForm';

export default function StationPopupContent({ station, routeColor }) {
  const [showFeedback, setShowFeedback] = useState(false);

  if (showFeedback) {
    return (
      <NodeFeedbackForm 
        lat={station.lat} 
        lng={station.lng} 
        stationId={station.id} 
        stationName={station.name} 
        onClose={() => setShowFeedback(false)} 
      />
    );
  }

  return (
    <div className="popup-content">
      <div
        className="popup-badge"
        style={{ background: routeColor }}
      >
        {station.badge || station.id}
      </div>
      <h3 className="popup-title">{station.name}</h3>
      <p className="popup-hook">{station.hook}</p>
      {station.body && (
        <p className="popup-body">{station.body}</p>
      )}
      {station.imgs && station.imgs.length > 0 && (
        <div className="popup-images">
          {station.imgs.map((img, i) => (
            <figure key={i} className="popup-figure">
              <img
                src={`${BASE_URL}${img.src}`}
                alt={img.cap || station.name}
                loading="lazy"
                className="popup-img cursor-pointer hover:opacity-90 transition-opacity"
              />
              {img.cap && (
                <figcaption className="popup-caption">
                  {img.cap}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-slate-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFeedback(true);
          }}
          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
        >
          <span>✍️</span> 在這裡留下回憶與照片
        </button>
      </div>
    </div>
  );
}
