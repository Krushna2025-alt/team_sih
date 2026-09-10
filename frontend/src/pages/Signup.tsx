import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import { errorMessage } from '../services/api';
import { Button, Card, Field, Input, Select } from '../components/common/ui';
import type { Role } from '../types';

export default function Signup() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>((params.get('role') as Role) === 'buyer' ? 'buyer' : 'farmer');

  // Location fields
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsMessage('');
    try {
      const coords = await import('../utils/geolocation').then(m => m.getCurrentCoordinates());
      setCoordinates(coords);
      const geo = await import('../utils/geolocation').then(m => m.reverseGeocode(coords.latitude, coords.longitude));
      if (geo.village) setVillage(geo.village);
      if (geo.district) setDistrict(geo.district);
      if (geo.state) setState(geo.state);
      if (geo.pincode) setPincode(geo.pincode);
      setGpsMessage('Location detected successfully!');
    } catch (err: any) {
      setGpsMessage(err.message || 'Could not fetch GPS location. Please enter manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault(); 
    setBusy(true); 
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const formattedPhone = '+91' + phone.replace(/\D/g, '');
      const locationParts = [village, district, state].map(s => s.trim()).filter(Boolean);
      const formattedLocation = locationParts.join(', ') || 'Pune, Maharashtra';

      const newUser = await authService.signUp(email, password, name, role, formattedPhone, {
        location: formattedLocation,
        village: village.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      });
      setUser(newUser);
      nav(`/${newUser.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md space-y-4">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-farmer text-white">
            <Sprout size={26} />
          </span>
          <h1 className="mt-2 text-xl font-bold">{t('auth.signupTitle')}</h1>
        </div>
        
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <Field label={t('auth.nameLabel')} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          
          <Field label={t('auth.phoneLabel')} required>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="98XXXXXXXX" required />
          </Field>
          
          <Field label="Password" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </Field>

          <Field label="Confirm Password" required>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
          </Field>

          <Field label={t('auth.roleLabel')} required>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="farmer">{t('auth.roleFarmer')}</option>
              <option value="buyer">{t('auth.roleBuyer')}</option>
            </Select>
          </Field>

          {/* Location fields for Farmer */}
          {role === 'farmer' && (
            <div className="space-y-3 rounded-lg border border-farmer-light bg-farmer-light/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-farmer-dark">Farmer Location</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1 text-xs font-medium text-buyer hover:underline disabled:opacity-50"
                >
                  📍 {gpsLoading ? 'Detecting...' : 'Use Current Location'}
                </button>
              </div>

              {gpsMessage && (
                <p className="text-xs text-gray-600 italic">{gpsMessage}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Field label="Village / City">
                  <Input 
                    placeholder="e.g. Nandura" 
                    value={village} 
                    onChange={(e) => setVillage(e.target.value)} 
                  />
                </Field>
                <Field label="District">
                  <Input 
                    placeholder="e.g. Buldhana" 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)} 
                  />
                </Field>
                <Field label="State">
                  <Input 
                    placeholder="e.g. Maharashtra" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                  />
                </Field>
                <Field label="Pincode">
                  <Input 
                    placeholder="e.g. 443404" 
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)} 
                  />
                </Field>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" loading={busy}>Register</Button>
        </form>
        
        <button onClick={() => nav('/login')} className="w-full text-center text-sm text-buyer hover:underline">
          Already have an account? Log in
        </button>
      </Card>
    </div>
  );
}
