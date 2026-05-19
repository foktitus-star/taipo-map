import shapefile from 'shapefile';
import iconv from 'iconv-lite';
import proj4 from 'proj4';
import fs from 'fs';

// TWD97 to WGS84
proj4.defs(
  'EPSG:3826',
  '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

// Xinyi District Bounds (WGS84)
const minLng = 121.54, maxLng = 121.59;
const minLat = 25.01, maxLat = 25.05;

async function process() {
  const source = await shapefile.open('zoning_data/細計-面.shp', 'zoning_data/細計-面.dbf', {
    encoding: 'latin1'
  });
  
  const features = [];
  let count = 0;
  
  while (true) {
    const result = await source.read();
    if (result.done) break;
    
    const feature = result.value;
    const props = feature.properties;
    
    // Decode properties
    const decodedProps = {};
    for (const key in props) {
      const decodedKey = iconv.decode(Buffer.from(key, 'latin1'), 'big5');
      const value = props[key];
      const decodedValue = typeof value === 'string' ? iconv.decode(Buffer.from(value, 'latin1'), 'big5') : value;
      decodedProps[decodedKey] = decodedValue;
    }
    
    // Convert coordinates and check bounds
    const coords = feature.geometry.coordinates;
    let inBounds = false;
    
    const transformCoords = (pts) => {
      if (typeof pts[0] === 'number') {
        const [lng, lat] = proj4('EPSG:3826', 'EPSG:4326', [pts[0], pts[1]]);
        if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
          inBounds = true;
        }
        return [lng, lat];
      }
      return pts.map(transformCoords);
    };
    
    const newCoords = transformCoords(coords);
    
    if (inBounds) {
      features.push({
        type: 'Feature',
        properties: {
          name: decodedProps['使用分區'] || decodedProps['分區簡稱'] || '未知',
          short: decodedProps['分區簡稱'] || '',
          full: decodedProps['分區說明'] || '',
          code: decodedProps['分區代碼'] || '',
          original: decodedProps['原屬分區'] || ''
        },
        geometry: {
          type: feature.geometry.type,
          coordinates: newCoords
        }
      });
    }
    
    count++;
    if (count % 1000 === 0) console.log('Processed', count, 'features...');
  }
  
  const geojson = {
    type: 'FeatureCollection',
    features: features
  };
  
  fs.writeFileSync('public/data/xinyi_zoning.json', JSON.stringify(geojson));
  console.log('Finished! Saved', features.length, 'features to public/data/xinyi_zoning.json');
}

process().catch(console.error);
