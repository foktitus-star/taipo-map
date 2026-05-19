# Sentinel-2 Satellite Imagery Setup Guide

This guide explains how to set up Sentinel-2 satellite imagery for your map using Sentinel Hub.

## Step 1: Create a Free Sentinel Hub Account

1. Visit [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/)
2. Click **"Sign Up"** and create a free account
3. Verify your email address

## Step 2: Create a Configuration Instance

1. Log in to your Sentinel Hub account
2. Go to **Dashboard** (top right menu)
3. Click **"Configuration Utility"** tab
4. Click **"Create New Configuration"**
5. Select **"Simple WMS template"** as the base template
6. Give it a name (e.g., "Xinyi Water Map")
7. Click **"Create"**

## Step 3: Get Your Instance ID

1. After creating the configuration, you'll see your **INSTANCE_ID** displayed
2. Copy this ID (it looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Step 4: Add Instance ID to Your Map

1. Open `src/components/layers/SatelliteLayer.js`
2. Find this line at the top:
   ```javascript
   const SENTINEL_HUB_INSTANCE_ID = 'YOUR_INSTANCE_ID_HERE';
   ```
3. Replace `'YOUR_INSTANCE_ID_HERE'` with your actual Instance ID:
   ```javascript
   const SENTINEL_HUB_INSTANCE_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
   ```
4. Save the file

## Step 5: Test the Layer

1. The dev server should automatically reload
2. Open your map at `http://localhost:3000`
3. In the layer control panel, look for the **"🛰️ 衛星影像"** (Satellite Imagery) section
4. Toggle **"Sentinel-2 真彩色影像"** to see the satellite imagery

## Available Layers

Once configured, you'll have access to:

- **Sentinel-2 真彩色影像** - True color satellite imagery (RGB)
- **Sentinel-2 植被指數 (NDVI)** - Vegetation health index

## Troubleshooting

### Layer doesn't appear
- Make sure you've replaced `YOUR_INSTANCE_ID_HERE` with your actual Instance ID
- Check that your Sentinel Hub account is active
- Open browser DevTools (F12) → Console to see any error messages

### "Need to configure Instance ID" message
- This means the Instance ID is still set to the placeholder
- Follow Step 4 above to add your real Instance ID

### Tiles are loading slowly
- Sentinel Hub processes tiles on-demand, so first load may be slow
- Subsequent requests are cached

## Free Tier Limits

Sentinel Hub's free tier includes:
- ✅ Access to Sentinel-2 data
- ✅ WMS/WMTS services
- ✅ Reasonable request limits
- ✅ No credit card required

For production use or higher limits, consider upgrading to a paid plan.

## More Information

- [Sentinel Hub Documentation](https://docs.sentinel-hub.com/)
- [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/)
- [Sentinel-2 Data](https://sentinel.esa.int/web/sentinel/missions/sentinel-2)
