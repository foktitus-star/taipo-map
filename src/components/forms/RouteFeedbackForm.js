import { useState } from 'react';
import { useMap } from 'react-leaflet';

const SCORES = [
  { value: 1, label: '很差', emoji: '😣' },
  { value: 2, label: '不佳', emoji: '😕' },
  { value: 3, label: '普通', emoji: '😐' },
  { value: 4, label: '良好', emoji: '🙂' },
  { value: 5, label: '極佳', emoji: '😊' }
];

const FACTORS = [
  { id: 'shade', label: '遮蔭程度' },
  { id: 'surface', label: '路面狀況' },
  { id: 'safety', label: '安全感' },
  { id: 'comfort', label: '整體舒適度' }
];

export default function RouteFeedbackForm({ routeId, routeName, segmentId }) {
  const map = useMap();
  const [scores, setScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScoreChange = (factorId, value) => {
    setScores(prev => ({ ...prev, [factorId]: value }));
  };

  const handleSubmit = async () => {
    // Check if all factors are rated
    if (FACTORS.some(f => !scores[f.id])) {
      alert('請為所有項目進行評分');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'route_comfort',
      timestamp: new Date().toISOString(),
      route_id: routeId,
      route_name: routeName,
      segment_id: segmentId,
      scores: scores
    };

    try {
      const response = await fetch('/api/feedback-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('伺服器回應錯誤');
      }

      setIsSuccess(true);
      setTimeout(() => {
        map.closePopup();
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
        <h4 className="text-lg font-bold text-green-700">感謝您的評分！</h4>
        <p className="text-sm text-slate-500 mt-1">視窗將自動關閉...</p>
      </div>
    );
  }

  return (
    <div className="p-2 min-w-[280px]">
      <h3 className="font-bold text-lg text-blue-900 border-b pb-2 mb-3">
        {routeName} <span className="text-sm text-slate-500 font-normal ml-1">路線評分</span>
      </h3>

      <div className="space-y-4 mb-4">
        {FACTORS.map(factor => (
          <div key={factor.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="font-bold text-sm text-blue-800 mb-2">{factor.label}</h4>
            <div className="flex justify-between gap-1">
              {SCORES.map(score => (
                <button
                  key={score.value}
                  onClick={() => handleScoreChange(factor.id, score.value)}
                  title={score.label}
                  className={`
                    flex flex-col items-center flex-1 py-1 rounded transition-colors
                    ${scores[factor.id] === score.value ? 'bg-blue-100 shadow-sm ring-1 ring-blue-300' : 'hover:bg-slate-200 opacity-60'}
                  `}
                >
                  <span className="text-xl leading-none mb-1">{score.emoji}</span>
                  <span className="text-[10px] text-slate-600 leading-tight hidden sm:block">{score.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
        onClick={handleSubmit}
        disabled={isSubmitting || FACTORS.some(f => !scores[f.id])}
      >
        {isSubmitting ? '送出中...' : '送出回饋'}
      </button>
    </div>
  );
}
