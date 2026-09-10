import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { qk } from '../../utils/constants';
import { PageHeader, Card, StatusBadge, Button, PageLoading, ErrorState, EmptyState, Input } from '../../components/common/ui';
import { OrderStatus } from '../../types';
import { useState } from 'react';

export default function FarmerOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: qk.orders('farmer'),
    queryFn: () => getOrders('farmer'),
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.orders('farmer') });
    },
  });

  const { mutate: negotiate, isPending: isNegotiating } = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => {
      // Assuming we added this to orderService
      return import('../../services/orderService').then(m => m.negotiateOrder(id, price, 'farmer'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.orders('farmer') });
      setNegotiationId(null);
      setNegotiationPrice('');
    },
  });

  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [negotiationPrice, setNegotiationPrice] = useState<string>('');

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: qk.orders('farmer') })} />;
  if (!orders?.length) return <EmptyState title={t('orders.noOrders')} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.orders')} />
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold">Order #{order.id.slice(-4).toUpperCase()}</h3>
                <p className="text-sm text-gray-500">Buyer: {order.counterpartyName}</p>
                <div className="mt-2 text-sm text-gray-700">
                  {order.items.map((it) => (
                    <div key={it.id}>{it.quantityKg}kg {it.productName}</div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <p className="font-semibold text-lg text-farmer-dark">₹{order.total}</p>
                <p className="text-xs text-gray-500">Delivery: {order.deliveryDate}</p>
              </div>
            </div>
            
            {order.status === 'pending' && negotiationId !== order.id && (
              <div className="mt-4 flex gap-2 justify-end pt-4 border-t border-gray-100">
                <Button 
                  tone="outline"
                  onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                  disabled={isPending || isNegotiating}
                >
                  Reject
                </Button>
                <Button 
                  tone="outline"
                  className="border-buyer text-buyer hover:bg-buyer-light"
                  onClick={() => setNegotiationId(order.id)}
                  disabled={isPending || isNegotiating}
                >
                  Negotiate
                </Button>
                <Button 
                  onClick={() => updateStatus({ id: order.id, status: 'confirmed' })}
                  disabled={isPending || isNegotiating}
                >
                  Confirm Order
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
                <p className="text-sm text-gray-500 mb-4">Last proposed by: {order.negotiationBy === 'farmer' ? 'You' : 'Buyer'}</p>
                
                {order.negotiationBy === 'buyer' && (
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
                {order.negotiationBy === 'farmer' && (
                  <p className="text-sm italic text-gray-500 text-right">Waiting for buyer to respond...</p>
                )}
              </div>
            )}
            {order.status === 'confirmed' && (
              <div className="mt-4 flex justify-end pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => updateStatus({ id: order.id, status: 'dispatched' })}
                  disabled={isPending}
                >
                  Mark as Dispatched
                </Button>
              </div>
            )}
            {order.status === 'dispatched' && (
              <div className="mt-4 flex justify-end pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => updateStatus({ id: order.id, status: 'delivered' })}
                  disabled={isPending}
                >
                  Mark as Delivered
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
