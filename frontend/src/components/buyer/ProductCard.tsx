import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import { formatCurrency, formatKg } from '../../utils/format';
import { productEmoji } from '../../utils/constants';
import { Badge, Stars } from '../common/ui';
export default function ProductCard({ p }: { p: Product }) {
const { t } = useTranslation();
return (
<Link to={`/buyer/products/${p.id}`} className="block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
<div className="flex h-28 items-center justify-center bg-farmer-light text-4xl" role="img" aria-label={p.product}>
{productEmoji(p.product)}
</div>
<div className="p-3">
<div className="flex items-center justify-between gap-2">
<h3 className="font-semibold">{p.product}</h3>
<Badge tone="gray">{t('common.quality')} {p.quality}</Badge>
</div>
<p className="mt-1 font-bold text-farmer-dark">{formatCurrency(p.pricePerKg)}/kg</p>
<p className="text-sm text-gray-500">{t('common.available')}: {formatKg(p.availableQtyKg)}</p>
<p className="truncate text-sm text-gray-600">
{p.farmerName} {p.farmerVerified && <BadgeCheck size={14} className="mb-0.5 inline text-buyer" aria-label={t('ratings.verified')} />}
</p>
{p.location && (
<p className="mt-0.5 truncate text-xs text-gray-500 flex items-center gap-0.5">
  📍 {p.location}
</p>
)}
<div className="mt-1 flex items-center justify-between text-sm">
<Stars value={Math.round(p.farmerRating)} />
{p.distanceKm != null && p.distanceKm > 0 ? (
  <div className="flex flex-col items-end">
    <span className="text-xs font-semibold text-buyer">📏 {p.distanceKm.toFixed(1)} km away</span>
    {p.distanceKm <= 10 ? (
      <span className="text-xs font-bold text-green-600">🟢 Nearby</span>
    ) : p.distanceKm <= 50 ? (
      <span className="text-xs font-semibold text-yellow-600">🟡 Within 50 KM</span>
    ) : null}
  </div>
) : (
  <span className="text-xs text-gray-400"></span>
)}
</div>
</div>
</Link>
);
}
