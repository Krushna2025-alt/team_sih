import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/orderService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, Card, Button, Input, Select, Field } from '../../components/common/ui';
import { Trash2 } from 'lucide-react';
import type { DeliveryType } from '../../types';

export default function BuyerCart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, remove, setQty, clear, count, subtotal } = useCart();
  const queryClient = useQueryClient();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const deliveryFee = deliveryType === 'pickup' ? 0 : subtotal >= 5000 ? 0 : 200;
  const total = subtotal + deliveryFee;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () => createOrder({
      items: items.map(i => ({ listingId: i.product.id, quantityKg: i.qtyKg })),
      deliveryType,
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      address: deliveryType === 'delivery' ? address : 'Pickup Location',
      paymentMethod: 'cash_on_delivery',
    }),
    onSuccess: () => {
      clear();
      queryClient.invalidateQueries({ queryKey: qk.orders('buyer') });
      navigate('/buyer/orders', { replace: true });
    },
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-gray-500">Looks like you haven't added any products to your cart yet.</p>
        <Button onClick={() => navigate('/buyer/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Shopping Cart" subtitle={`You have ${count} items in your cart.`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-3xl shrink-0">
                {productEmoji(item.product.product)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.product.product}</h3>
                <p className="text-sm text-gray-500">Sold by {item.product.farmerName}</p>
                <p className="font-semibold text-buyer mt-1">₹{item.product.pricePerKg}/kg</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Qty (kg):</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={item.product.availableQtyKg} 
                    value={item.qtyKg} 
                    onChange={(e) => setQty(item.product.id, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                <button 
                  onClick={() => remove(item.product.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <Field label="Delivery Method">
                <Select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}>
                  <option value="delivery">Delivery to Address</option>
                  <option value="pickup">Self Pickup</option>
                </Select>
              </Field>

              {deliveryType === 'delivery' && (
                <Field label="Delivery Address" required>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full address" />
                </Field>
              )}

              <Field label="Preferred Date" required>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </Field>
            </div>

            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t mt-4">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-6"
              tone="buyer"
              onClick={() => placeOrder()}
              loading={isPending}
              disabled={deliveryType === 'delivery' && !address.trim()}
            >
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
