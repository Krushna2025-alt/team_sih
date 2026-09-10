import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Power, MapPin, ArrowLeft, Calendar, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deactivateListing, getListing, updateListing } from '../../services/listingService';
import { qk, productEmoji } from '../../utils/constants';
import { formatCurrency, formatDate, formatKg } from '../../utils/format';
import { Badge, Button, Card, ErrorState, PageLoading, StatusBadge } from '../../components/common/ui';
import MapView from '../../components/common/MapView';

export default function FarmerListingDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: l, isLoading, error, refetch } = useQuery({ queryKey: qk.listing(id!), queryFn: () => getListing(id!) });
  
  const toggle = useMutation({
    mutationFn: () => (l!.status === 'active' ? deactivateListing(l!.id) : updateListing(l!.id, { status: 'active' })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });

  if (isLoading) return <PageLoading />;
  if (error || !l) return <ErrorState error={error} onRetry={refetch} />;

  const imageUrl = l.images && l.images.length > 0 && l.images[0] ? l.images[0] : null;

  return (
    <div className="space-y-6 mx-auto max-w-lg">
      <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-farmer-light overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={l.product}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`text-3xl ${imageUrl ? 'hidden' : ''}`} role="img" aria-label={l.product}>
                {productEmoji(l.product)}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{l.product}</h2>
              <p className="text-lg font-bold text-farmer-dark">{formatCurrency(l.pricePerKg)}/kg</p>
            </div>
          </div>
          <StatusBadge status={l.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-gray-100 py-3 text-sm">
          <div>
            <span className="text-gray-500">{t('common.available')}:</span>
            <p className="font-semibold text-gray-800">{formatKg(l.availableQtyKg)}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('common.quality')}:</span>
            <p className="font-semibold text-gray-800">Grade {l.quality}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('listings.delivery')}:</span>
            <p className="font-semibold capitalize text-gray-800">{l.delivery}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('listings.availableFrom')}:</span>
            <p className="font-semibold text-gray-800">{formatDate(l.availableFrom)}</p>
          </div>
        </div>

        {/* Location Section */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin size={16} className="text-farmer-dark" />
            <span>Location: <strong className="text-gray-900">{l.location || 'Pune, Maharashtra'}</strong></span>
          </div>
          {l.latitude != null && l.longitude != null && (
            <div className="mt-3">
              <MapView lat={l.latitude} lng={l.longitude} label={l.location || l.product} height={180} />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link to={`/farmer/listings/new?id=${l.id}`} className="flex-1">
            <Button tone="outline" className="w-full">
              <Pencil size={16} /> {t('common.edit')}
            </Button>
          </Link>
          <Button
            tone={l.status === 'active' ? 'danger' : 'outline'}
            className="flex-1"
            loading={toggle.isPending}
            onClick={() => toggle.mutate()}
          >
            <Power size={16} />
            {l.status === 'active' ? t('listings.deactivate') : t('listings.activate')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

