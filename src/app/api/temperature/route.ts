import { NextResponse } from 'next/server';
import ee from '@google/earthengine';

const PRIVATE_KEY = process.env.GEE_PRIVATE_KEY ? process.env.GEE_PRIVATE_KEY.replace(/\\n/g, '\n') : '';
const CLIENT_EMAIL = process.env.GEE_CLIENT_EMAIL || '';

export async function GET() {
  if (!PRIVATE_KEY || !CLIENT_EMAIL) {
    return NextResponse.json({ error: 'GEE credentials not configured' }, { status: 500 });
  }

  try {
    // Authenticate and Initialize
    await new Promise((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(
        {
          client_email: CLIENT_EMAIL,
          private_key: PRIVATE_KEY,
        },
        () => {
          ee.initialize(null, null, resolve, reject);
        },
        reject
      );
    });

    // Define ROI (Taipei Region approximately)
    const roi = ee.Geometry.Rectangle([121.4, 24.9, 121.7, 25.2]);

    // Get Landsat 8 Collection 2 Tier 1 Level 2
    // Filter to Summer 2024 (e.g., June 1 to August 31)
    const dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterBounds(roi)
      .filterDate('2024-06-01', '2024-08-31')
      .filter(ee.Filter.lt('CLOUD_COVER', 20)); // Only images with less than 20% clouds

    // Calculate median to reduce cloud issues and get typical summer temperature
    const image = dataset.median();

    // The ST_B10 band is the surface temperature in Kelvin (scaled)
    const stBand = image.select('ST_B10');
    
    // Apply scale factor and convert to Celsius:
    // LST = (ST_B10 * 0.00341802 + 149.0) - 273.15
    const lstCelsius = stBand
      .multiply(0.00341802)
      .add(149.0)
      .subtract(273.15);

    // Get Map ID with a color palette suitable for temperature
    const mapParams = {
      min: 25,
      max: 45,
      palette: [
        '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
        '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
        '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
        'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
        'ff0000', 'de0101', 'c21301', 'a71001', '911003'
      ]
    };

    const mapId: any = await new Promise((resolve, reject) => {
      lstCelsius.getMap(mapParams, (result: any, err: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // 回傳 Tile URL 模板給前端 Leaflet 使用 (mapId.urlFormat 相當於獲取 Tile URL)
    return NextResponse.json({
      urlFormat: mapId.urlFormat
    });

  } catch (error: any) {
    console.error('GEE API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Earth Engine request' }, { status: 500 });
  }
}
