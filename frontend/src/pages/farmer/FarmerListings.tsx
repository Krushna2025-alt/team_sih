import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Power } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deactivateListing, getMyListings, updateListing } from '../../services/listingService';
import { qk } from '../../utils/constants';
import { formatCurrency, formatKg, formatDate } from '../../utils/format';
import { productEmoji } from '../../utils/constants';
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } 
from '../../components/common/ui';
export default function FarmerListings() {
const { t } = useTranslation();
const nav = useNavigate();
const qc = useQueryClient();
const { data, isLoading, error, refetch } = useQuery({ queryKey: qk.listings('mine'), queryFn: 
getMyListings });
const toggle = useMutation({
mutationFn: (l: { id: string; status: string }) =>
l.status === 'active' ? deactivateListing(l.id) : updateListing(l.id, { status: 'active' }),
onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
});
if (isLoading) return <PageLoading />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
const listings = data ?? [];
return (
<div className="space-y-4">
<PageHeader
title={t('listings.mine')}
action={<Link to="/farmer/listings/new"><Button><Plus size={18} />{t('farmerDash.addProduct')}</Button></Link>}
/>
{listings.length === 0 ? (
<EmptyState title={t('listings.empty')} subtitle={t('listings.emptyHint')}
action={<Link to="/farmer/listings/new"><Button>{t('farmerDash.addProduct')}</Button></Link>} />
) : (
<div className="grid gap-3 md:grid-cols-2">
{listings.map((l) => (
<Card key={l.id} className="flex gap-3">
<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-farmer-light 
text-3xl" role="img" aria-label={l.product}>{productEmoji(l.product)}</div>
<div className="min-w-0 flex-1">
<div className="flex items-center justify-between gap-2">
<button onClick={() => nav(`/farmer/listings/${l.id}`)} className="truncate font-semibold 
hover:underline">{l.product}</button>
<StatusBadge status={l.status} />
</div>
<p className="text-sm text-gray-600">
{formatCurrency(l.pricePerKg)}/kg &middot; {formatKg(l.availableQtyKg)} &middot; {t('common.quality')} {l.quality}
</p>
<p className="text-xs text-gray-400">
{t('listings.availableFrom')}: {formatDate(l.availableFrom)} &middot; {t(`listings.${l.delivery === 'pickup' ? 'pickup' : 'delivery'}`)}
</p>
{l.location && (
<p className="text-xs text-farmer-dark font-medium mt-0.5 flex items-center gap-1">
  📍 {l.location}
</p>
)}
<div className="mt-2 flex gap-2">
<Link to={`/farmer/listings/new?id=${l.id}`}>
<Button tone="outline" className="!px-3 !py-1.5 text-sm"><Pencil size={14} />{t('common.edit')}</Button>
</Link>
<Button
tone={l.status === 'active' ? 'danger' : 'outline'}
className="!px-3 !py-1.5 text-sm"
loading={toggle.isPending && toggle.variables?.id === l.id}
onClick={() => toggle.mutate({ id: l.id, status: l.status })}
>
<Power size={14} />
{l.status === 'active' ? t('listings.deactivate') : t('listings.activate')}
</Button>
</div>
</div>
</Card>
))}
</div>
)}
</div>
);
}
