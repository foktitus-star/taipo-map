# 信水義河 — 信義社大水文導覽互動地圖

四條路線、57 個站點，帶你走讀台北信義區兩百年的水文故事。

## 路線總覽

| 路線 | 名稱 | 站數 | 起點 | 顏色 |
|------|------|------|------|------|
| 路線一 | 瑠公圳水泱泱 三犁農田綠昂揚 | 17 站 | 六張犁捷運站 | 🔵 藍色 |
| 路線二 | 信義之源 陂水之觀 | 12 站 | 永春捷運站 | 🟢 綠色 |
| 路線三 | 錫口 五分埔支線 | 12 站 | 象山站周邊 | 🟠 橙色 |
| 路線四 | 東西神 三大排水系 | 16 站 | 象山公園 | 🟣 紫色 |

## 技術架構

- **Framework**: Next.js 16 (App Router)
- **地圖**: react-leaflet + Leaflet.js
- **底圖**: OpenStreetMap (免費，無需 API Key)
- **樣式**: Tailwind CSS v4
- **部署**: Vercel

## 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev
# → http://localhost:3000

# 正式建置
npm run build
npm start
```

## 部署到 Vercel

```bash
# 方法一：Vercel CLI
npm i -g vercel
vercel

# 方法二：GitHub 連動
# 推送至 GitHub，在 Vercel Dashboard 匯入 repo 即可
```

## 資料來源

站點資料來自 [xycc.pages.dev](https://xycc.pages.dev)（信義社大水文化脈絡特展）

## 專案結構

```
xinyi-water-map/
├── src/
│   ├── app/
│   │   ├── globals.css      # 全域樣式 + Leaflet 暗色主題
│   │   ├── layout.js        # Root layout + 字型 + SEO
│   │   └── page.js          # 首頁（動態載入地圖）
│   ├── components/
│   │   └── MapView.js       # 核心地圖元件
│   └── data/
│       └── routeData.js     # 四條路線完整資料
├── vercel.json               # Vercel 部署設定
└── package.json
```
