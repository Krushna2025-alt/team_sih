import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { qk } from '../../utils/constants';
import { PageHeader, Card, StatusBadge, PageLoading, ErrorState, EmptyState, Button, Input } from '../../components/common/ui';
import { OrderStatus } from '../../types';

export default function BuyerOrders() {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [negotiationPrice, setNegotiationPrice] = useState<string>('');

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: qk.orders('buyer'),
    queryFn: () => getOrders('buyer'),
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.orders('buyer') });
    },
  });

  const { mutate: negotiate, isPending: isNegotiating } = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => {
      return import('../../services/orderService').then(m => m.negotiateOrder(id, price, 'buyer'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.orders('buyer') });
      setNegotiationId(null);
      setNegotiationPrice('');
    },
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!orders?.length) return <EmptyState title="No Order History" subtitle="You haven't placed any orders yet." />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.orders')} subtitle="Track and manage your purchases." />
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 sm:p-6 border-l-4 border-l-buyer">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold">Order #{order.id.slice(-4).toUpperCase()}</h3>
                <p className="text-sm text-gray-500">Seller: {order.counterpartyName}</p>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex gap-4">
                      <span className="font-medium">{it.productName}</span>
                      <span className="text-gray-500">{it.quantityKg}kg</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <p className="font-semibold text-xl text-gray-900 mt-2">₹{order.total}</p>
                <p className="text-xs text-gray-500">Delivery: {order.deliveryDate}</p>
                <p className="text-xs text-gray-500 capitalize">{order.deliveryType}</p>
              </div>
            </div>

            {order.status === 'pending' && negotiationId !== order.id && (
              <div className="mt-4 flex gap-2 justify-end pt-4 border-t border-gray-100">
                <Button 
                  tone="outline"
                  onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                  disabled={isPending || isNegotiating}
                >
                  Cancel Order
                </Button>
                <Button 
                  tone="outline"
                  className="border-buyer text-buyer hover:bg-buyer-light"
                  onClick={() => setNegotiationId(order.id)}
                  disabled={isPending || isNegotiating}
                >
                  Negotiate Price
                </Button>
              </div>
            )}
            
            {negotiationId === order.id && (
              <div className="mt-4 p-4 border border-buyer rounded-lg space-y-3">
                <p className="font-semibold text-buyer">Propose a new price</p>
                <Input 
                  type="number" 
                  placeholder="New Price per kg (₹)" 
                  value={negotiationPrice} 
                  onChange={(e) => setNegotiationPrice(e.target.value)} 
                />
                <div className="flex justify-end gap-2">
                  <Button tone="outline" onClick={() => setNegotiationId(null)}>Cancel</Button>
                  <Button 
                    tone="buyer" 
                    loading={isNegotiating} 
                    onClick={() => negotiate({ id: order.id, price: Number(negotiationPrice) })}
                    disabled={!negotiationPrice}
                  >
                    Submit Counter-offer
                  </Button>
                </div>
              </div>
            )}

            {order.status === 'negotiating' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-800 flex justify-between">
                  <span>Negotiation in progress</span>
                  <span className="text-buyer font-bold">Proposed Price: ₹{order.negotiationPrice}/kg</span>
                </p>
                <p className="text-sm text-gray-500 mb-4">Last proposed by: {order.negotiationBy === 'buyer' ? 'You' : 'Farmer'}</p>
                
                {order.negotiationBy === 'farmer' && (
                  <div className="flex gap-2 justify-end">
                     <Button 
                      tone="outline"
                      onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                      disabled={isPending}
                    >
                      Reject Counter-offer
                    </Button>
                    <Button 
                      onClick={() => updateStatus({ id: order.id, status: 'confirmed' })}
                      disabled={isPending}
                    >
                      Accept Counter-offer
                    </Button>
                  </div>
                )}
                {order.negotiationBy === 'buyer' && (
                  <p className="text-sm italic text-gray-500 text-right">Waiting for farmer to respond...</p>
                )}
              </div>
            )}
            
            {order.status === 'delivered' && !order.hasRated && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button className="text-sm font-semibold text-buyer hover:underline">
                  Rate Seller & Products
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
