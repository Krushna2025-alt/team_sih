import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProduct } from '../../services/listingService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, Card, Button, PageLoading, ErrorState, Badge, Stars } from '../../components/common/ui';
import { formatCurrency, formatDate, formatKg } from '../../utils/format';
import { ArrowLeft, MessageCircle, ShoppingBag, BadgeCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import MapView from '../../components/common/MapView';

export default function BuyerProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation();
  const { add } = useCart();

  const { data: p, isLoading, error, refetch } = useQuery({
    queryKey: qk.product(id!),
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoading />;
  if (error || !p) return <ErrorState error={error} onRetry={refetch} />;

  const isAvailable = p.status === 'Available' || p.status === 'active';
  const imageUrl = p.images && p.images.length > 0 && p.images[0] ? p.images[0] : null;

  const handleAddToCart = () => {
    add(p, Math.min(100, p.availableQtyKg));
    nav('/buyer/cart');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to Products
      </button>

      <PageHeader title={p.product} />

      <Card className="overflow-hidden">
        <div className="relative flex h-56 sm:h-72 items-center justify-center bg-farmer-light overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.product}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fallback = (e.target as HTMLElement).nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`text-6xl ${imageUrl ? 'hidden' : ''}`} role="img" aria-label={p.product}>
            {productEmoji(p.product)}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{p.product}</h2>
              <p className="mt-1 text-3xl font-bold text-farmer-dark">{formatCurrency(p.pricePerKg)}<span className="text-lg text-gray-500">/kg</span></p>
              <div className="mt-2 flex gap-2">
                <Badge tone="gray">Quality: {p.quality}</Badge>
                {isAvailable ? (
                  <Badge tone="green">Available</Badge>
                ) : (
                  <Badge tone="red">{p.status}</Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 sm:w-48">
              <Button tone="buyer" className="w-full" onClick={handleAddToCart} disabled={!isAvailable}>
                <ShoppingBag size={18} /> Add to Cart
              </Button>
              {p.farmerPhone ? (
                <a href={`tel:${p.farmerPhone}`} className="w-full">
                  <Button tone="outline" className="w-full">
                    <MessageCircle size={18} /> Contact Farmer
                  </Button>
                </a>
              ) : (
                <Button tone="outline" className="w-full" disabled>
                  <MessageCircle size={18} /> Contact Unavailable
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 pt-6 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">Product Details</h3>
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gray-400" />
                  <span>Available Quantity: <strong className="text-gray-900">{formatKg(p.availableQtyKg)}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Listed on: <strong className="text-gray-900">{formatDate(p.createdAt)}</strong></span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Farmer Information</h3>
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
                <p className="font-medium text-gray-900">
                  {p.farmerName}
                  {p.farmerVerified && <BadgeCheck size={16} className="ml-1 text-buyer inline" />}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Stars value={Math.round(p.farmerRating || 5)} />
                  <span>({p.farmerReliability}% reliable)</span>
                </div>

                {p.location && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700 pt-1">
                    <MapPin size={15} className="text-buyer" />
                    <span>Location: <strong>{p.location}</strong></span>
                  </p>
                )}

                {p.distanceKm != null && p.distanceKm > 0 && (
                  <p className="text-xs font-semibold text-buyer flex flex-col gap-1">
                    <span>📍 Approximately {p.distanceKm.toFixed(1)} km away from you</span>
                    {p.distanceKm <= 10 ? (
                      <span className="text-green-600 font-bold text-sm">🟢 Nearby</span>
                    ) : p.distanceKm <= 50 ? (
                      <span className="text-yellow-600 font-semibold text-sm">🟡 Within 50 KM</span>
                    ) : null}
                  </p>
                )}

                {(p.farmerPhone || p.farmerEmail) && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Public Contact Details</p>
                    {p.farmerPhone && (
                      <p className="text-sm text-gray-700 flex items-center gap-2">📞 <a href={`tel:${p.farmerPhone}`} className="text-buyer hover:underline font-medium">{p.farmerPhone}</a></p>
                    )}
                    {p.farmerEmail && (
                      <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">✉️ <a href={`mailto:${p.farmerEmail}`} className="text-buyer hover:underline">{p.farmerEmail}</a></p>
                    )}
                  </div>
                )}

                {p.latitude != null && p.longitude != null && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Approximate Region</p>
                    <MapView lat={p.latitude} lng={p.longitude} label={p.location || p.product} height={170} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
