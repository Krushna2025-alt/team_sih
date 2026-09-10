import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { createListing, getListing, updateListing } from '../../services/listingService';
import { qk } from '../../utils/constants';
import { errorMessage } from '../../services/api';
import { Button, Card, Field, Input, PageHeader, PageLoading, Select } from '../../components/common/ui';
export default function FarmerListingNew() {
const { t } = useTranslation();
const nav = useNavigate();
const qc = useQueryClient();
const [params] = useSearchParams();
const id = params.get('id') ?? undefined;
const isEdit = Boolean(id);
const schema = z.object({
product: z.string().min(2, t('validation.required')),
quantityKg: z.coerce.number({ invalid_type_error: 
t('validation.positive') }).positive(t('validation.positive')),
pricePerKg: z.coerce.number({ invalid_type_error: 
t('validation.positive') }).positive(t('validation.positive')),
quality: z.enum(['A', 'B', 'C']),
availableFrom: z.string().min(1, t('validation.required')),
delivery: z.enum(['pickup', 'delivery']),
imageUrl: z.string().optional(),
});
type FV = z.infer<typeof schema>;
const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FV>({
resolver: zodResolver(schema),
defaultValues: { product: '', quantityKg: 0, pricePerKg: 0, quality: 'A', availableFrom: '', delivery: 
'pickup', imageUrl: '' },
});
const existing = useQuery({ queryKey: qk.listing(id!), queryFn: () => getListing(id!), enabled: 
isEdit });
const prefilledProduct = params.get('product');
useEffect(() => {
if (prefilledProduct) {
  setValue('product', prefilledProduct);
}
}, [prefilledProduct, setValue]);
useEffect(() => {
if (existing.data) {
const l = existing.data;
reset({
product: l.product, quantityKg: l.quantityKg, pricePerKg: l.pricePerKg,
quality: l.quality as any, availableFrom: l.availableFrom, delivery: l.delivery as any, imageUrl: l.images[0] ?? '',
});
}
}, [existing.data]);
const save = useMutation({
mutationFn: (v: FV) => {
const body = {
product: v.product, quantityKg: v.quantityKg, pricePerKg: v.pricePerKg, quality: v.quality as any,
availableFrom: v.availableFrom, delivery: v.delivery as any, images: v.imageUrl ? [v.imageUrl] : [],
};
return isEdit ? updateListing(id!, body) : createListing(body);
},
onSuccess: () => {
qc.invalidateQueries({ queryKey: ['listings'] });
qc.invalidateQueries({ queryKey: ['products'] });
nav('/farmer/listings');
},
});
if (isEdit && existing.isLoading) return <PageLoading />;
return (
<div className="mx-auto max-w-lg">
<PageHeader title={isEdit ? t('listings.editTitle') : t('listings.newTitle')} />
<Card className="space-y-4">
<Field label={t('listings.productName')} error={errors.product?.message} required>
<Input {...register('product')} placeholder="Tomato" />
</Field>
<div className="grid grid-cols-2 gap-3">
<Field label={`${t('common.quantity')} (kg)`} error={errors.quantityKg?.message} required>
<Input type="number" step="any" min="0" {...register('quantityKg')} />
</Field>
<Field label={t('listings.expectedPrice')} error={errors.pricePerKg?.message} required>
<Input type="number" step="any" min="0" {...register('pricePerKg')} />
</Field>
</div>
<div className="grid grid-cols-2 gap-3">
<Field label={t('listings.qualityGrade')} required>
<Select {...register('quality')}>
<option value="A">A</option><option value="B">B</option><option value="C">C</option>
</Select>
</Field>
<Field label={t('listings.availableFrom')} error={errors.availableFrom?.message} required>
<Input type="date" {...register('availableFrom')} />
</Field>
</div>
<Field label={t('listings.deliveryOption')} required>
<Select {...register('delivery')}>
<option value="pickup">{t('listings.pickup')}</option>
<option value="delivery">{t('listings.delivery')}</option>
</Select>
</Field>
<Field label={t('listings.imageUrl')} error={errors.imageUrl?.message}>
<div className="flex flex-col gap-3">
  <Input {...register('imageUrl')} placeholder="https://..." />
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-gray-600">Or Capture / Upload:</span>
    <input 
      type="file" 
      accept="image/*" 
      capture="environment" 
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) {
          const reader = new FileReader();
          reader.onload = (ev) => setValue('imageUrl', ev.target?.result as string, { shouldValidate: true });
          reader.readAsDataURL(f);
        }
      }} 
      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-farmer file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-farmer-dark touch" 
    />
  </div>
  {watch('imageUrl') && (
    <img src={watch('imageUrl')} alt="Preview" className="mt-2 max-h-48 w-full rounded-xl object-cover shadow-sm" />
  )}
</div>
</Field>
{save.isError && <p className="text-sm text-red-600">{errorMessage(save.error)}</p>}
<div className="flex gap-3">
<Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}
>{t('common.publish')}</Button>
<Button tone="outline" onClick={() => nav('/farmer/listings')}>{t('common.cancel')}</Button>
</div>
</Card>
</div>
);
}
