import { supabase } from './supabaseClient';
import { getSessionUser } from './authService';
import type { Demand, DemandMatch } from '../types';

const STORAGE_KEY = 'krishilink_real_demands';

const getLocalDemands = (): Demand[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalDemand = (demand: Demand) => {
  try {
    const list = getLocalDemands();
    const existingIndex = list.findIndex(d => d.id === demand.id);
    if (existingIndex >= 0) {
      list[existingIndex] = demand;
    } else {
      list.unshift(demand);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

export const createDemand = async (body: Partial<Demand>): Promise<Demand> => {
  const user = await getSessionUser();
  const newDemand: Demand = {
    id: `dem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    buyerId: user?.id || 'anonymous-buyer',
    buyerName: user?.name || 'Buyer',
    product: body.product || 'Produce',
    quantityKg: Number(body.quantityKg || 0),
    minPricePerKg: Number(body.minPricePerKg || 0),
    maxPricePerKg: Number(body.maxPricePerKg || 0),
    requiredDate: body.requiredDate || new Date().toISOString().split('T')[0],
    address: body.address || 'Delivery Location',
    notes: body.notes || '',
    status: 'open',
    distanceKm: Number(body.distanceKm || 12),
    createdAt: new Date().toISOString(),
  };

  if (supabase && user) {
    try {
      const { data, error } = await supabase
        .from('demands')
        .insert([{
          buyer_id: user.id,
          buyer_name: user.name,
          product: newDemand.product,
          quantity_kg: newDemand.quantityKg,
          min_price_per_kg: newDemand.minPricePerKg,
          max_price_per_kg: newDemand.maxPricePerKg,
          required_date: newDemand.requiredDate,
          address: newDemand.address,
          notes: newDemand.notes,
          status: 'open',
          distance_km: newDemand.distanceKm,
        }])
        .select()
        .single();

      if (!error && data) {
        newDemand.id = data.id;
        newDemand.createdAt = data.created_at;
      }
    } catch (err) {
      console.warn('Supabase demands insert fallback to local:', err);
    }
  }

  saveLocalDemand(newDemand);
  return newDemand;
};

export const getMyDemands = async (): Promise<Demand[]> => {
  const user = await getSessionUser();
  let dbDemands: Demand[] = [];

  if (supabase && user) {
    try {
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbDemands = data.map((d: any): Demand => ({
          id: d.id,
          buyerId: d.buyer_id,
          buyerName: d.buyer_name,
          product: d.product,
          quantityKg: Number(d.quantity_kg),
          minPricePerKg: Number(d.min_price_per_kg || 0),
          maxPricePerKg: Number(d.max_price_per_kg || 0),
          requiredDate: d.required_date,
          address: d.address,
          notes: d.notes,
          status: d.status,
          distanceKm: Number(d.distance_km || 0),
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getMyDemands fallback:', err);
    }
  }

  if (dbDemands.length > 0) return dbDemands;

  const locals = getLocalDemands();
  return user ? locals.filter(d => d.buyerId === user.id || !d.buyerId) : locals;
};

import { calculateDistanceKm } from '../utils/geolocation';

export const getMatches = async (): Promise<DemandMatch[]> => {
  let dbDemands: Demand[] = [];
  const currentUser = await getSessionUser();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbDemands = data.map((d: any): Demand => ({
          id: d.id,
          buyerId: d.buyer_id,
          buyerName: d.buyer_name,
          product: d.product,
          quantityKg: Number(d.quantity_kg),
          minPricePerKg: Number(d.min_price_per_kg || 0),
          maxPricePerKg: Number(d.max_price_per_kg || 0),
          requiredDate: d.required_date,
          address: d.address,
          notes: d.notes,
          status: d.status,
          distanceKm: Number(d.distance_km || 12),
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getMatches fallback:', err);
    }
  }

  const allDemands = dbDemands.length > 0 ? dbDemands : getLocalDemands().filter(d => d.status === 'open');

  // Fetch buyer profiles
  const buyerIds = [...new Set(allDemands.map(d => d.buyerId).filter(Boolean))];
  const profilesMap: Record<string, any> = {};
  if (buyerIds.length > 0 && supabase) {
    try {
      const { data: profiles } = await supabase.from('profiles').select('id, phone, email, latitude, longitude').in('id', buyerIds);
      if (profiles) {
        profiles.forEach((prof: any) => {
          profilesMap[prof.id] = prof;
        });
      }
    } catch (e) {
      console.warn('Failed to fetch buyer profiles:', e);
    }
  }

  const farmerLat = currentUser?.latitude;
  const farmerLon = currentUser?.longitude;

  let matches: DemandMatch[] = allDemands.map((d): DemandMatch => {
    let distance = d.distanceKm || 12;
    const buyerProfile = profilesMap[d.buyerId];
    
    if (farmerLat != null && farmerLon != null && buyerProfile?.latitude != null && buyerProfile?.longitude != null) {
      distance = calculateDistanceKm(farmerLat, farmerLon, buyerProfile.latitude, buyerProfile.longitude) ?? distance;
    }

    return {
      id: d.id,
      product: d.product,
      quantityKg: d.quantityKg,
      requiredDate: d.requiredDate,
      minPricePerKg: d.minPricePerKg,
      maxPricePerKg: d.maxPricePerKg,
      distanceKm: distance,
      buyerName: d.buyerName || 'Verified Buyer',
      buyerVerified: true,
      address: d.address || 'Delivery Location',
      notes: d.notes || '',
      buyerPhone: buyerProfile?.phone,
      buyerEmail: buyerProfile?.email,
    };
  });

  // Filter out > 50 KM if gps is available
  if (farmerLat != null && farmerLon != null) {
    matches = matches.filter(m => m.distanceKm <= 50);
  }

  // Sort: 10KM priority, then by distance
  matches.sort((a, b) => {
    const aPriority = a.distanceKm <= 10;
    const bPriority = b.distanceKm <= 10;
    
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;

    return a.distanceKm - b.distanceKm;
  });

  return matches;
};

export const updateDemand = async (id: string, body: Partial<Demand>): Promise<Demand> => {
  if (supabase) {
    try {
      await supabase
        .from('demands')
        .update({
          ...(body.status ? { status: body.status } : {}),
          ...(body.quantityKg ? { quantity_kg: body.quantityKg } : {}),
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase updateDemand fallback:', err);
    }
  }

  const locals = getLocalDemands();
  const item = locals.find(d => d.id === id);
  if (item) {
    Object.assign(item, body);
    saveLocalDemand(item);
    return item;
  }

  return {
    id,
    buyerId: '',
    buyerName: '',
    product: body.product || '',
    quantityKg: body.quantityKg || 0,
    requiredDate: '',
    minPricePerKg: 0,
    maxPricePerKg: 0,
    address: '',
    status: (body.status as any) || 'open',
    createdAt: new Date().toISOString(),
  };
};


