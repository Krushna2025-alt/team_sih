import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
export default function MapView({
lat, lng, radiusKm = 5, height = 260, label,
}: { lat?: number; lng?: number; radiusKm?: number; height?: number; label?: string }) {
const ref = useRef<HTMLDivElement>(null);
const [failed, setFailed] = useState(false);
const { t } = useTranslation();
useEffect(() => {
if (lat == null || lng == null || !ref.current) return;
let map: any;
let cancelled = false;
(async () => {
try {
const L = await import('leaflet');
if (cancelled || !ref.current) return;
map = L.map(ref.current).setView([lat, lng], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
// Approximate location only — no exact sensitive location
L.circleMarker([lat, lng], { radius: 8, color: '#16a34a', fillOpacity: 0.8 }).addTo(map).bindPopup(label || '');
L.circle([lat, lng], { radius: radiusKm * 1000, color: '#16a34a', weight: 1, fillOpacity: 0.08 }).addTo(map);
} catch {
setFailed(true);
}
})();
return () => { cancelled = true; if (map) map.remove(); };
}, [lat, lng]);
if (lat == null || lng == null || failed) {
return (
<div className="flex items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-500" style={{ height }}>
{t('common.mapUnavailable')}
</div>
);
}
return <div ref={ref} style={{ height }} className="z-0 rounded-xl border" aria-label="Map" />;
}
