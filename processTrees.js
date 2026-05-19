const fs = require('fs');
const proj4 = require('proj4');

proj4.defs(
  'EPSG:3826',
  '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

const inputFile = 'C:\\Users\\samli\\Antigravity-智慧城市\\TaipeiTree.json';
const outputFile = 'C:\\Users\\samli\\Antigravity-智慧城市\\xinyi-water-map-main\\xinyi-water-map-main\\public\\TaipeiTree_filtered.json';

console.log('Reading input file...');
const rawData = fs.readFileSync(inputFile, 'utf-8');
const trees = JSON.parse(rawData);

const filteredTrees = [];

console.log(`Processing ${trees.length} trees...`);

for (const t of trees) {
  const x = parseFloat(t.TWD97X || t.X || t.TWD97_X || t.x);
  const y = parseFloat(t.TWD97Y || t.Y || t.TWD97_Y || t.y);

  if (!isNaN(x) && !isNaN(y)) {
    const [lng, lat] = proj4('EPSG:3826', 'EPSG:4326', [x, y]);
    if (lat >= 25.012777 && lat <= 25.051619 && lng >= 121.549092 && lng <= 121.592334) {
      // Create a clean version of the object with only necessary fields to save space
      filteredTrees.push({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        TreeID: t.TreeID,
        TreeType: t.TreeType,
        TreeHeight: t.TreeHeight,
        Diameter: t.Diameter
      });
    }
  }
}

console.log(`Filtered trees: ${filteredTrees.length}`);
fs.writeFileSync(outputFile, JSON.stringify(filteredTrees));
console.log('Saved to', outputFile);
