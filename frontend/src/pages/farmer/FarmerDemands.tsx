import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getMatches } from '../../services/demandService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, Card, Button, PageLoading, ErrorState, EmptyState } from '../../components/common/ui';
import { MapPin, Calendar, Verified } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FarmerDemands() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: matches, isLoading, error, refetch } = useQuery({
    queryKey: qk.demandMatches(),
    queryFn: getMatches,
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!matches?.length) return <EmptyState title="No matched demands found" subtitle="Buyers haven't posted any requirements that match your inventory yet." />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Buyer Demands" 
        subtitle="These are active requirements from buyers that perfectly match your products." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="p-4 sm:p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="text-3xl bg-gray-50 p-3 rounded-lg">{productEmoji(match.product)}</div>
                <div>
                  <h3 className="text-lg font-bold">{match.product}</h3>
                  <p className="text-sm text-gray-500 font-medium">{match.quantityKg}kg needed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Price Range</p>
                <p className="font-semibold text-farmer-dark">₹{match.minPricePerKg} - ₹{match.maxPricePerKg}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 flex-grow">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Required by <span className="font-medium">{match.requiredDate}</span></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="truncate">
                  {match.address} 
                  {match.distanceKm != null && match.distanceKm > 0 && (
                    <span className="block text-xs mt-0.5">
                      📏 {match.distanceKm.toFixed(1)} km away
                      {match.distanceKm <= 10 ? (
                        <span className="text-green-600 font-bold ml-2">🟢 Nearby</span>
                      ) : match.distanceKm <= 50 ? (
                        <span className="text-yellow-600 font-semibold ml-2">🟡 Within 50 KM</span>
                      ) : null}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Buyer</span>
                  <span className="font-semibold">{match.buyerName}</span>
                  {match.buyerVerified && <Verified className="w-4 h-4 text-blue-500" />}
                </div>
                {(match.buyerPhone || match.buyerEmail) && (
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    {match.buyerPhone && <p>📞 <a href={`tel:${match.buyerPhone}`} className="hover:text-farmer-dark font-medium">{match.buyerPhone}</a></p>}
                    {match.buyerEmail && <p>✉️ <a href={`mailto:${match.buyerEmail}`} className="hover:text-farmer-dark">{match.buyerEmail}</a></p>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
              {match.buyerPhone && (
                <a href={`tel:${match.buyerPhone}`} className="w-full">
                  <Button tone="outline" className="w-full">
                    Contact Buyer
                  </Button>
                </a>
              )}
              <Button className="w-full" onClick={() => navigate(`/farmer/listings/new?product=${encodeURIComponent(match.product)}`)}>
                Create Listing for this Demand
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
