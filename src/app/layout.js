import './globals.css';

export const metadata = {
  title: '大埔地圖導覽 — 林村河至吐露港社區導覽互動地圖',
  description:
    '沿著林村河，從廣福橋踏查至大埔海濱公園回歸塔，感受河口生態與環境變遷。林村河與吐露港的豐富故事，就藏在你每天走過的街道裡。',
  keywords: '大埔,地圖導覽,林村河,回歸塔,大埔海濱公園,吐露港,互動地圖',
  openGraph: {
    title: '大埔地圖導覽 — 林村河至吐露港社區導覽地圖',
    description: '沿著林村河，從廣福橋踏查至大埔海濱公園回歸塔，感受河口生態與環境變遷。',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Viewer.js for image lightbox */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.js" async></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
