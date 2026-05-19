import { NextResponse } from 'next/server';
import proj4 from 'proj4';

// TWD97 to WGS84
proj4.defs(
  'EPSG:3826',
  '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET() {
  const now = Date.now();
  if (cachedData && now - lastFetch < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch('https://tppkl.blob.core.windows.net/blobfs/TaipeiTree.csv');
    const text = await response.text();
    
    // Simple CSV parser
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const distIdx = headers.indexOf('Dist');
    const typeIdx = headers.indexOf('TreeType');
    const regIdx = headers.indexOf('Region');
    const xIdx = headers.indexOf('TWD97X');
    const yIdx = headers.indexOf('TWD97Y');
    const idIdx = headers.indexOf('TreeID');

    const targetDistricts = ['南港區', '信義區', '松山區', '內湖區'];
    
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const row = lines[i].split(',');
      
      const district = row[distIdx];
      if (targetDistricts.includes(district)) {
        const x = parseFloat(row[xIdx]);
        const y = parseFloat(row[yIdx]);
        
        if (!isNaN(x) && !isNaN(y)) {
          // Convert TWD97 to WGS84
          const [lng, lat] = proj4('EPSG:3826', 'EPSG:4326', [x, y]);
          
          results.push({
            id: row[idIdx],
            type: row[typeIdx],
            addr: row[regIdx],
            lat,
            lng
          });
        }
      }
    }

    cachedData = results;
    lastFetch = now;
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch tree data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
