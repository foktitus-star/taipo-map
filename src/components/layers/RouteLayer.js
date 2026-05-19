import { Polyline, CircleMarker, Popup, LayerGroup, FeatureGroup } from 'react-leaflet';
import { BASE_URL } from '@/data/routeData';
import PopupLightbox from './PopupLightbox';
import RouteFeedbackForm from '../forms/RouteFeedbackForm';
import StationPopupContent from './StationPopupContent';

export default function RouteLayer({ route, polylines }) {
  return (
    <LayerGroup>
      {/* Polylines */}
      {Array.isArray(polylines[0])
        ? Array.isArray(polylines[0][0])
          ? polylines.map((seg, si) => (
            <FeatureGroup key={`${route.id}-seg-group-${si}`}>
              {/* Visible Polyline */}
              <Polyline
                positions={seg}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.75,
                  dashArray: null,
                  interactive: false // Let the invisible line handle clicks
                }}
              />
              {/* Invisible Hit Area */}
              <Polyline
                positions={seg}
                pathOptions={{
                  color: '#000000',
                  weight: 20,
                  opacity: 0.001,
                  interactive: true
                }}
              >
                <Popup className="feedback-popup" minWidth={300} maxWidth={400}>
                  <RouteFeedbackForm 
                    routeId={route.id}
                    routeName={route.name || `路線 ${route.id}`} 
                    segmentId={`seg_${si + 1}`} 
                  />
                </Popup>
              </Polyline>
            </FeatureGroup>
          ))
          : (
            <FeatureGroup>
              <Polyline
                positions={polylines}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.75,
                  interactive: false
                }}
              />
              <Polyline
                positions={polylines}
                pathOptions={{
                  color: '#000000',
                  weight: 20,
                  opacity: 0.001,
                  interactive: true
                }}
              >
                <Popup className="feedback-popup" minWidth={300} maxWidth={400}>
                  <RouteFeedbackForm 
                    routeId={route.id}
                    routeName={route.name || `路線 ${route.id}`} 
                    segmentId={`seg_1`} 
                  />
                </Popup>
              </Polyline>
            </FeatureGroup>
          )
        : null}

      {/* Station markers */}
      {route.stations.map((station) => (
        <CircleMarker
          key={`${route.id}-${station.id}`}
          center={[station.lat, station.lng]}
          radius={8}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: route.color,
            fillOpacity: 1,
          }}
        >
          <Popup
            maxWidth={420}
            minWidth={340}
            className="custom-popup"
          >
            <PopupLightbox />
            <StationPopupContent station={station} routeColor={route.color} />
          </Popup>
        </CircleMarker>
      ))}
    </LayerGroup>
  );
}
