// testSaveFull.mjs - attempts to save a full routePayload similar to admin editor
import 'dotenv/config';
import { db } from './src/lib/firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function testFullWrite() {
  const waypoints = [
    { id: '1', name: '導賞景點 1', latlng: [25.0418, 121.5620], description: 'test', audioUrl: '', imageUrl: '' },
    { id: '2', name: '導賞景點 2', latlng: [25.0420, 121.5625], description: 'test2', audioUrl: '', imageUrl: '' }
  ];
  const segmentProfiles = ['foot'];
  const segmentsPath = [[waypoints[0].latlng, waypoints[1].latlng]];

  const stations = waypoints.map((wp, idx) => ({
    id: wp.id,
    name: wp.name,
    lat: wp.latlng[0],
    lng: wp.latlng[1],
    badge: idx === 0 ? '起點' : idx === waypoints.length - 1 ? '終點' : `站 ${String.fromCharCode(65 + idx)}`,
    hook: wp.description.substring(0, 40),
    body: wp.description,
    imgs: wp.imageUrl ? [wp.imageUrl] : [],
    audioUrl: wp.audioUrl || ''
  }));

  const segments = segmentsPath.map((path, idx) => ({
    from: waypoints[idx].id,
    to: waypoints[idx + 1].id,
    waypoints: path.slice(1, -1).map(coord => ({ lat: coord[0], lng: coord[1] }))
  }));

  const routePayload = {
    id: 'test_route',
    name: '測試路線',
    subtitle: '測試說明',
    color: '#3b82f6',
    colorDark: '#1d4ed8',
    startStation: waypoints[0].name,
    stationCount: waypoints.length,
    stations,
    segments,
    published: true,
    editorDraft: {
      waypoints,
      segmentProfiles,
      segmentsPath: JSON.stringify(segmentsPath),
      routeName: '測試路線',
      routeDescription: '測試說明',
      published: true
    },
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'guided_routes', 'test_route'), routePayload);
    console.log('✅ Full payload write succeeded');
  } catch (err) {
    console.error('❌ Full payload write failed:', err);
  }
}

testFullWrite();
