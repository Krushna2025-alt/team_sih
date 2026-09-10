import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { getDeals, submitOffer } from '../../services/bulkDealService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, Card, Button, Input, Field, StatusBadge, PageLoading, ErrorState, EmptyState } from '../../components/common/ui';

export default function BuyerBulkDeals() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [bidForm, setBidForm] = useState({ qtyKg: '', pricePerKg: '', deliveryDate: '' });

  const { data: deals, isLoading, error, refetch } = useQuery({
    queryKey: qk.bulkDeals('buyer'),
    queryFn: getDeals,
  });

  const { mutate: placeBid, isPending } = useMutation({
    mutationFn: (dealId: string) => submitOffer(dealId, {
      qtyKg: parseInt(bidForm.qtyKg),
      pricePerKg: parseInt(bidForm.pricePerKg),
      deliveryDate: bidForm.deliveryDate
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.bulkDeals('buyer') });
      setSelectedDeal(null);
      setBidForm({ qtyKg: '', pricePerKg: '', deliveryDate: '' });
    },
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  
  const openDeals = deals?.filter(d => d.status === 'open') || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Procurement Deals" subtitle="Bid on large-scale farmer inventories at competitive prices." />

      {openDeals.length === 0 ? (
        <EmptyState title="No active bulk deals" subtitle="Farmers haven't posted any new bulk inventories." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {openDeals.map((deal) => (
            <Card key={deal.id} className="p-4 sm:p-6 flex flex-col h-full border-t-4 border-t-buyer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="text-4xl bg-gray-50 p-4 rounded-xl">{productEmoji(deal.product)}</div>
                  <div>
                    <h3 className="text-xl font-bold">{deal.product}</h3>
                    <p className="text-sm text-gray-500">From {deal.farmerName}</p>
                    <div className="mt-1 flex gap-2">
                      <StatusBadge status={deal.status} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Base Price</p>
                  <p className="font-bold text-2xl text-gray-900">₹{deal.basePricePerKg}/kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg mb-6">
                <div>
                  <p className="text-gray-500 text-xs">Total Available</p>
                  <p className="font-semibold">{deal.totalQtyKg} kg</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Min Order Qty</p>
                  <p className="font-semibold">{deal.minOrderQtyKg} kg</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Closing Date</p>
                  <p className="font-semibold">{deal.closingDate}</p>
                </div>
              </div>

              <div className="mt-auto">
                {selectedDeal === deal.id ? (
                  <div className="space-y-4 border border-buyer p-4 rounded-lg">
                    <h4 className="font-bold text-buyer">Submit Your Bid</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Qty (kg)" required>
                        <Input 
                          type="number" 
                          min={deal.minOrderQtyKg} 
                          max={deal.totalQtyKg} 
                          value={bidForm.qtyKg} 
                          onChange={(e) => setBidForm(p => ({ ...p, qtyKg: e.target.value }))} 
                        />
                      </Field>
                      <Field label="Your Price (₹)" required>
                        <Input 
                          type="number" 
                          value={bidForm.pricePerKg} 
                          onChange={(e) => setBidForm(p => ({ ...p, pricePerKg: e.target.value }))} 
                        />
                      </Field>
                      <div className="col-span-2">
                        <Field label="Delivery Date" required>
                          <Input 
                            type="date" 
                            value={bidForm.deliveryDate} 
                            onChange={(e) => setBidForm(p => ({ ...p, deliveryDate: e.target.value }))} 
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button tone="outline" className="py-1 px-3 text-sm" onClick={() => setSelectedDeal(null)}>Cancel</Button>
                      <Button tone="buyer" className="py-1 px-3 text-sm" loading={isPending} onClick={() => placeBid(deal.id)}>
                        Place Bid
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button className="w-full bg-buyer hover:bg-buyer-dark" onClick={() => setSelectedDeal(deal.id)}>
                    Make an Offer
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
