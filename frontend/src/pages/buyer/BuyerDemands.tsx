import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getMyDemands, createDemand } from '../../services/demandService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, Card, StatusBadge, Button, Input, Field, Textarea, PageLoading, ErrorState, EmptyState } from '../../components/common/ui';
import type { Demand } from '../../types';

export default function BuyerDemands() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Demand>>({});

  const { data: demands, isLoading, error, refetch } = useQuery({
    queryKey: qk.demands('buyer'),
    queryFn: getMyDemands,
  });

  const { mutate: addDemand, isPending } = useMutation({
    mutationFn: () => createDemand(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.demands('buyer') });
      queryClient.invalidateQueries({ queryKey: qk.demandMatches() });
      setShowForm(false);
      setForm({});
    },
  });

  const set = (k: keyof Demand) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="My Demands" subtitle="Post requirements so farmers can find you." />
        {!showForm && <Button onClick={() => setShowForm(true)}>Post New Demand</Button>}
      </div>

      {showForm && (
        <Card className="p-6 border-buyer">
          <h3 className="text-xl font-bold mb-4">Post a Requirement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required><Input value={form.product || ''} onChange={set('product')} placeholder="e.g. Tomato, Rice" /></Field>
            <Field label="Quantity Needed (kg)" required><Input type="number" value={form.quantityKg || ''} onChange={set('quantityKg')} /></Field>
            <Field label="Max Price per kg (₹)" required><Input type="number" value={form.maxPricePerKg || ''} onChange={set('maxPricePerKg')} /></Field>
            <Field label="Required By Date" required><Input type="date" value={form.requiredDate || ''} onChange={set('requiredDate')} /></Field>
            <Field label="Delivery Address" required><Input value={form.address || ''} onChange={set('address')} /></Field>
            <Field label="Additional Notes"><Textarea value={form.notes || ''} onChange={set('notes')} placeholder="Quality requirements, specifics..." rows={1} /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button tone="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="bg-buyer hover:bg-buyer-dark" onClick={() => addDemand()} loading={isPending}>Publish Demand</Button>
          </div>
        </Card>
      )}

      {!demands?.length ? (
        <EmptyState title="No active demands" subtitle="Post a demand to let farmers know what you need." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demands.map((demand) => (
            <Card key={demand.id} className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="text-3xl bg-gray-50 p-3 rounded-lg">{productEmoji(demand.product)}</div>
                  <div>
                    <h3 className="text-lg font-bold">{demand.product}</h3>
                    <p className="text-sm text-gray-500 font-medium">Looking for {demand.quantityKg}kg</p>
                  </div>
                </div>
                <StatusBadge status={demand.status} />
              </div>

              <div className="space-y-2 text-sm text-gray-700 flex-grow">
                <p><strong>Max Price:</strong> ₹{demand.maxPricePerKg}/kg</p>
                <p><strong>Required By:</strong> {demand.requiredDate}</p>
                <p><strong>Location:</strong> {demand.address}</p>
                {demand.notes && <p className="text-gray-500 italic mt-2 text-xs">"{demand.notes}"</p>}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-400">Posted on {demand.createdAt.split('T')[0]}</span>
                <span className="font-semibold text-buyer hover:underline cursor-pointer">View Farmer Matches</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
