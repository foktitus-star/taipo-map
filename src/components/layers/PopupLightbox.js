'use client';

import { useEffect } from 'react';

export default function PopupLightbox() {
  useEffect(() => {
    let viewer;
    const timer = setTimeout(() => {
      // 尋找目前開啟的 popup 中的圖片容器
      const container = document.querySelector('.leaflet-popup-content .popup-images');
      if (container && window.Viewer) {
        viewer = new window.Viewer(container, {
          zIndex: 99999, // 確保高於 Leaflet 與其他 UI
          navbar: true,  // 顯示縮圖導覽
          title: false,  // 不顯示標題
          tooltip: false, // 隱藏縮放比例提示
          movable: true,  // 支援拖曳
          zoomable: true, // 支援縮放
          rotatable: false,
          scalable: false,
          transition: true,
          backdrop: true, // 點擊背景關閉
          button: true,   // 顯示右上角關閉按鈕
          toolbar: {
            zoomIn: 1,
            zoomOut: 1,
            oneToOne: 1,
            reset: 1,
            prev: 1,
            play: 0,
            next: 1,
            rotateLeft: 0,
            rotateRight: 0,
            flipHorizontal: 0,
            flipVertical: 0,
          },
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  return null;
}
