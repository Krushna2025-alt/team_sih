import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDeals, respondOffer } from '../../services/bulkDealService';
import { qk } from '../../utils/constants';
import { PageHeader, Card, Button, StatusBadge, PageLoading, ErrorState, EmptyState } from '../../components/common/ui';

export default function FarmerBulkDeals() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: deals, isLoading, error, refetch } = useQuery({
    queryKey: qk.bulkDeals('farmer'),
    queryFn: getDeals,
  });

  const { mutate: updateOfferStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => respondOffer(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.bulkDeals('farmer') });
    },
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!deals?.length) return <EmptyState title="No Bulk Deals" subtitle="You haven't posted any bulk deals yet." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="My Bulk Deals" subtitle="Manage your large scale listings and review buyer bids." />
        <Button>Create Bulk Deal</Button>
      </div>

      <div className="space-y-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold">{deal.product}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total available: <span className="font-semibold">{deal.totalQtyKg}kg</span> • Min order: {deal.minOrderQtyKg}kg
                </p>
                <p className="text-sm text-gray-500 mt-1">Base Price: ₹{deal.basePricePerKg}/kg</p>
              </div>
              <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                <StatusBadge status={deal.status} />
                <p className="text-sm text-gray-500">Closes: {deal.closingDate}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Buyer Offers ({deal.offers.length})</h4>
              {deal.offers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No offers received yet.</p>
              ) : (
                <div className="space-y-3">
                  {deal.offers.map((offer) => (
                    <div key={offer.id} className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{offer.buyerName}</p>
                          <StatusBadge status={offer.status} />
                        </div>
                        <p className="text-sm mt-1">
                          Bidding <span className="font-bold text-farmer-dark">₹{offer.pricePerKg}/kg</span> for {offer.qtyKg}kg
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {offer.reasons?.map((r, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">
                              {r.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {offer.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            tone="outline" 
                            onClick={() => updateOfferStatus({ id: offer.id, status: 'rejected' })}
                            disabled={isPending}
                          >
                            Reject
                          </Button>
                          <Button 
                            onClick={() => updateOfferStatus({ id: offer.id, status: 'accepted' })}
                            disabled={isPending}
                          >
                            Accept Offer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
