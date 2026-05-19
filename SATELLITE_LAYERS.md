# Satellite Imagery Layers

Your map now supports multiple satellite imagery sources with different characteristics.

## Available Layers

### 1. Esri 衛星影像 (Recommended)
- **Type**: XYZ Tiles
- **Source**: Esri World Imagery
- **Authentication**: None required
- **Quality**: High resolution
- **Performance**: ⭐⭐⭐⭐⭐ Excellent
- **Coverage**: Global
- **Update Frequency**: Varies by region
- **Best For**: General use, reliable performance

### 2. Sentinel-2 真彩色
- **Type**: WMS (Web Map Service)
- **Source**: Copernicus Data Space Ecosystem
- **Authentication**: Requires free account
- **Quality**: High resolution (10m)
- **Performance**: ⭐⭐⭐ Good (on-demand processing)
- **Coverage**: Global
- **Update Frequency**: Every 5 days
- **Best For**: Recent imagery, scientific analysis

### 3. Sentinel-2 植被指數 (NDVI)
- **Type**: WMS (Web Map Service)
- **Source**: Copernicus Data Space Ecosystem
- **Authentication**: Requires free account
- **Quality**: High resolution (10m)
- **Performance**: ⭐⭐⭐ Good (on-demand processing)
- **Coverage**: Global
- **Update Frequency**: Every 5 days
- **Best For**: Vegetation health monitoring, environmental analysis

## Technical Details

### Geographic Bounds
All satellite layers are limited to the Taipei City area for optimal performance:
- Southwest: 24.95°N, 121.45°E
- Northeast: 25.20°N, 121.70°E

### Zoom Levels
- Minimum Zoom: 10 (prevents loading at very far distances)
- Maximum Zoom: 18 (full detail available)

### Sentinel-2 Parameters
The Sentinel-2 layers use the following parameters:
- **Time Range**: 2024-01-01 to 2025-12-31 (gets most recent imagery)
- **Max Cloud Coverage**: 50% (filters out very cloudy images)
- **Show Logo**: Disabled (cleaner map appearance)

## Usage Tips

### For Best Performance:
1. Start with **Esri 衛星影像** - it loads fastest
2. Use Sentinel-2 when you need:
   - Very recent imagery (within last few days)
   - Specific spectral analysis (NDVI)
   - Scientific-grade data

### Troubleshooting Sentinel-2:

**If Sentinel-2 layers don't load:**
1. Check your Instance ID is correct in `SatelliteLayer.js`
2. Verify your Sentinel Hub account is active
3. Check browser console (F12) for error messages
4. Try increasing the time range if no recent imagery is available
5. The configuration may need to be set up with proper data sources

**Common Issues:**
- **Blank tiles**: May indicate no imagery available for the time period
- **Slow loading**: WMS processes tiles on-demand (first load is slower)
- **Error messages**: Check Instance ID and account status

### Adjusting Opacity:
All satellite layers support opacity adjustment (0-100%) via the slider in the control panel. This allows you to:
- Blend satellite imagery with historical maps
- Compare different time periods
- Overlay with route data

## Future Enhancements

Possible additions:
- More Sentinel-2 products (False Color, SWIR, etc.)
- Time slider for historical imagery comparison
- Cloud-free composite imagery
- Custom date range selection

## Data Sources

- **Esri World Imagery**: https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9
- **Sentinel-2**: https://dataspace.copernicus.eu/
- **Copernicus Program**: https://www.copernicus.eu/

## License & Attribution

- **Esri World Imagery**: © Esri and its licensors
- **Sentinel-2**: © European Union, Copernicus Sentinel-2 data
