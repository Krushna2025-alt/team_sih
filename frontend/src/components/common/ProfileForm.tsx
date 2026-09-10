import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import * as authService from '../../services/authService';
import { errorMessage } from '../../services/api';
import { getCurrentCoordinates, reverseGeocode, formatLocationString } from '../../utils/geolocation';
import { Button, Card, Field, Input } from './ui';

export default function ProfileForm() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const { lang, setLang } = useLanguage();

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({
    latitude: user?.latitude,
    longitude: user?.longitude,
  });

  const schema = z.object({
    name: z.string().min(2, t('validation.required')),
    phone: z.string().optional(),
    village: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    location: z.string().optional(),
  });

  type FV = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      village: user?.village ?? '',
      district: user?.district ?? '',
      state: user?.state ?? '',
      pincode: user?.pincode ?? '',
      location: user?.location ?? '',
    },
  });

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsMessage('');
    try {
      const c = await getCurrentCoordinates();
      setCoords(c);
      const geo = await reverseGeocode(c.latitude, c.longitude);
      if (geo.village) setValue('village', geo.village);
      if (geo.district) setValue('district', geo.district);
      if (geo.state) setValue('state', geo.state);
      if (geo.pincode) setValue('pincode', geo.pincode);
      if (geo.formattedLocation) setValue('location', geo.formattedLocation);
      setGpsMessage('Location detected successfully via GPS!');
    } catch (err: any) {
      setGpsMessage(err.message || 'Could not fetch GPS. You can enter location manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const save = useMutation({
    mutationFn: (v: FV) => {
      const loc = v.location?.trim() || formatLocationString(v.village, v.district, v.state) || user?.location || 'Pune, Maharashtra';
      return authService.updateProfile({
        name: v.name,
        phone: v.phone,
        location: loc,
        village: v.village?.trim() || undefined,
        district: v.district?.trim() || undefined,
        state: v.state?.trim() || undefined,
        pincode: v.pincode?.trim() || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
    onSuccess: (u) => setUser(u),
  });

  if (!user) return null;

  return (
    <Card className="max-w-md space-y-4">
      <Field label={t('common.name')} error={errors.name?.message as string} required>
        <Input {...register('name')} />
      </Field>

      <Field label={t('common.phone')} error={errors.phone?.message as string}>
        <Input {...register('phone')} inputMode="tel" />
      </Field>

      {/* Location Section */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            {user.role === 'farmer' ? 'Farmer Location' : 'Location'}
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1 text-xs font-semibold text-buyer hover:underline disabled:opacity-50"
          >
            📍 {gpsLoading ? 'Detecting...' : 'Use Current Location'}
          </button>
        </div>

        {gpsMessage && (
          <p className="text-xs text-gray-600 italic">{gpsMessage}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="Village / City">
            <Input placeholder="e.g. Nandura" {...register('village')} />
          </Field>
          <Field label="District">
            <Input placeholder="e.g. Buldhana" {...register('district')} />
          </Field>
          <Field label="State">
            <Input placeholder="e.g. Maharashtra" {...register('state')} />
          </Field>
          <Field label="Pincode">
            <Input placeholder="e.g. 443404" {...register('pincode')} />
          </Field>
        </div>

        <Field label="Display Location Label">
          <Input placeholder="e.g. Nandura, Maharashtra" {...register('location')} />
        </Field>
      </div>

      <Field label={t('common.language')}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="touch w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px]"
        >
          <option value="en">English</option>
          <option value="mr">Marathi</option>
          <option value="hi">Hindi</option>
        </select>
      </Field>

      {save.isError && <p className="text-sm text-red-600">{errorMessage(save.error)}</p>}
      {save.isSuccess && <p className="text-sm text-farmer-dark">{t('profile.updated')}</p>}

      <Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>
        {t('profile.update')}
      </Button>
    </Card>
  );
}

