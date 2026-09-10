import { supabase } from './supabaseClient';
import type { Role, User } from '../types';

const AUTH_NOT_CONFIGURED = 'Auth is not configured. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.';

export interface SignUpLocationOptions {
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

async function loadProfile(userId: string): Promise<User> {
  if (!supabase) throw new Error(AUTH_NOT_CONFIGURED);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Profile not found for this user.');
  }

  return {
    id: data.id,
    name: data.full_name,
    role: data.role as Role,
    verified: true,
    rating: 5.0,
    reliability: 100,
    location: data.location || 'Unknown',
    village: data.village || undefined,
    district: data.district || undefined,
    state: data.state || undefined,
    pincode: data.pincode || undefined,
    latitude: data.latitude != null ? Number(data.latitude) : undefined,
    longitude: data.longitude != null ? Number(data.longitude) : undefined,
  };
}

export async function getSessionUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  try {
    return await loadProfile(session.user.id);
  } catch (err) {
    console.error('Failed to load profile for session', err);
    return null; // Return null to trigger logout / redirect to login
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: Role,
  phone: string,
  locationOpts?: SignUpLocationOptions
): Promise<User> {
  if (!supabase) throw new Error(AUTH_NOT_CONFIGURED);

  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        phone: phone,
      }
    }
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('Registration failed, no user returned.');

  // Upsert profile into public.profiles
  const profileRecord: any = {
    id: authData.user.id,
    full_name: fullName,
    email,
    role,
    phone,
    location: locationOpts?.location || 'Pune, Maharashtra',
  };

  if (locationOpts?.village) profileRecord.village = locationOpts.village;
  if (locationOpts?.district) profileRecord.district = locationOpts.district;
  if (locationOpts?.state) profileRecord.state = locationOpts.state;
  if (locationOpts?.pincode) profileRecord.pincode = locationOpts.pincode;
  if (locationOpts?.latitude != null) profileRecord.latitude = locationOpts.latitude;
  if (locationOpts?.longitude != null) profileRecord.longitude = locationOpts.longitude;

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([profileRecord], { onConflict: 'id' });

  if (profileError) {
    console.warn("Profile insert error (attempting fallback):", profileError);
    // If custom columns caused failure (table not migrated yet), fallback to standard columns
    try {
      await supabase
        .from('profiles')
        .upsert([{
          id: authData.user.id,
          full_name: fullName,
          email,
          role,
          phone,
          location: locationOpts?.location || 'Pune, Maharashtra',
        }], { onConflict: 'id' });
    } catch {
      // Ignored if user can be loaded
    }
  }

  return loadProfile(authData.user.id);
}

export async function signInPassword(email: string, password: string): Promise<User> {
  if (!supabase) throw new Error(AUTH_NOT_CONFIGURED);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Login failed.');
  
  return loadProfile(data.user.id);
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  if (!supabase) throw new Error(AUTH_NOT_CONFIGURED);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updateData.full_name = payload.name;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.location !== undefined) updateData.location = payload.location;
  if (payload.village !== undefined) updateData.village = payload.village;
  if (payload.district !== undefined) updateData.district = payload.district;
  if (payload.state !== undefined) updateData.state = payload.state;
  if (payload.pincode !== undefined) updateData.pincode = payload.pincode;
  if (payload.latitude !== undefined) updateData.latitude = payload.latitude;
  if (payload.longitude !== undefined) updateData.longitude = payload.longitude;

  // Try updating with all columns
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', session.user.id);

  // If column error occurs (e.g. before user executes schema_location.sql in Supabase), fallback to base columns
  if (error && (error.message.includes('column') || error.code === '42703')) {
    const fallbackData: Record<string, any> = {};
    if (payload.name !== undefined) fallbackData.full_name = payload.name;
    if (payload.phone !== undefined) fallbackData.phone = payload.phone;
    if (payload.location !== undefined) fallbackData.location = payload.location;

    const fb = await supabase.from('profiles').update(fallbackData).eq('id', session.user.id);
    if (fb.error) throw new Error(fb.error.message);
  } else if (error) {
    throw new Error(error.message);
  }

  return loadProfile(session.user.id);
}

// Stubs for previous APIs that are no longer used by the new email/password flow but keep TS happy if called elsewhere
export async function sendOtp(phone: string): Promise<void> {
  throw new Error("OTP login is disabled. Please use email and password.");
}
export async function verifyOtp(phone: string, token: string): Promise<User> {
  throw new Error("OTP login is disabled. Please use email and password.");
}

