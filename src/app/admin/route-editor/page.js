'use client';

import dynamic from 'next/dynamic';

// Leaflet requires window and other browser APIs, so we dynamically load the map component on the client-side only
const RouteEditorMap = dynamic(
  () => import('@/components/admin/RouteEditorMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-screen bg-[#0f0f1a]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-white/20 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm tracking-widest font-semibold">
            載入導賞編輯器中…
          </p>
        </div>
      </div>
    ),
  }
);

export default function RouteEditorPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-slate-950">
      <RouteEditorMap />
    </main>
  );
}
