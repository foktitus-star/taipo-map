import { useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

const TAGS = ['歷史', '水源', '生態', '氣味', '地景', '其他'];

export default function NodeFeedbackForm({ lat, lng, stationId, stationName, onClose }) {
  const map = useMap();
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoFilename, setPhotoFilename] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoBase64(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description.trim() && selectedTags.length === 0 && !photoBase64) {
      alert('請至少填寫文字、選擇標籤或上傳照片');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'node_feedback',
      timestamp: new Date().toISOString(),
      lat,
      lng,
      station_id: stationId || '',
      description: description.trim(),
      tags: selectedTags,
      photo_base64: photoBase64,
      photo_filename: photoFilename
    };

    try {
      const response = await fetch('/api/feedback-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('伺服器回應錯誤');
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
        else map.closePopup();
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('送出失敗，請稍後再試。');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h4 className="text-lg font-bold text-green-700">感謝您的分享！</h4>
        <p className="text-sm text-slate-500 mt-1">資料已成功送出。</p>
      </div>
    );
  }

  return (
    <div className="p-2 min-w-[280px]">
      <h3 className="font-bold text-lg text-primary-900 border-b pb-2 mb-3">
        {stationName || '新增標記'} <span className="text-sm text-slate-500 font-normal ml-1">提供回饋</span>
      </h3>

      <div className="space-y-4 mb-4">
        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">地景標籤 (可複選)</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${selectedTags.includes(tag) 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">您的記憶與故事</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="這裡有什麼特別的回憶嗎？"
            className="w-full p-2 border border-slate-200 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">上傳照片</label>
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoBase64 ? (
              <div className="relative">
                <img src={photoBase64} alt="Preview" className="max-h-32 mx-auto rounded" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoBase64(null); setPhotoFilename(''); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-xs">點擊選擇照片 (自動壓縮)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      
      <button
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
        onClick={handleSubmit}
        disabled={isSubmitting || (!description.trim() && selectedTags.length === 0 && !photoBase64)}
      >
        {isSubmitting ? '處理中 (若含照片可能需要較久)...' : '送出回饋'}
      </button>
    </div>
  );
}
