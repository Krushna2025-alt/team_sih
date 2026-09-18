import { supabase } from './supabaseClient';
import { getSessionUser } from './authService';
import { calculateDistanceKm } from '../utils/geolocation';
import type { Listing, Product, ProductFilters, Quality, DeliveryType } from '../types';

const mapListing = (row: any): Listing => ({
  id: row.id,
  farmerId: row.farmer_id,
  farmerName: row.farmer_name,
  product: row.product,
  quantityKg: Number(row.quantity_kg),
  availableQtyKg: Number(row.available_qty_kg),
  pricePerKg: Number(row.price_per_kg),
  quality: row.quality as Quality,
  availableFrom: row.available_from,
  delivery: row.delivery as DeliveryType,
  images: row.images || [],
  status: row.status,
  location: row.location || undefined,
  latitude: row.latitude != null ? Number(row.latitude) : undefined,
  longitude: row.longitude != null ? Number(row.longitude) : undefined,
  distanceKm: row.distance_km != null && Number(row.distance_km) > 0 ? Number(row.distance_km) : undefined,
  createdAt: row.created_at,
  verificationId: row.verification_id
});

const mapProduct = (row: any): Product => ({
  ...mapListing(row),
  farmerVerified: true, 
  farmerRating: 5.0,
  farmerReliability: 100
});

export const getMyListings = async (): Promise<Listing[]> => {
  const user = await getSessionUser();
  if (!user || !supabase) return [];

  const { data, error } = await supabase
    .from('farmer_listings')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
  return (data || []).map(mapListing);
};

export const getListing = async (id: string): Promise<Listing> => {
  if (!supabase) throw new Error('Not connected');

  const { data, error } = await supabase
    .from('farmer_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return mapListing(data);
};

export const createListing = async (body: Partial<Listing>): Promise<Listing> => {
  const user = await getSessionUser();
  if (!user || !supabase) throw new Error('Not authenticated');

  const insertData: any = {
    farmer_id: user.id,
    farmer_name: user.name,
    product: body.product,
    quantity_kg: body.quantityKg,
    available_qty_kg: body.quantityKg, // initial = total
    price_per_kg: body.pricePerKg,
    quality: body.quality,
    available_from: body.availableFrom,
    delivery: body.delivery,
    images: body.images || [],
    status: 'Available',
    distance_km: 0,
    location: body.location || user.location || 'Pune, Maharashtra',
  };

  if (user.latitude != null) insertData.latitude = user.latitude;
  if (user.longitude != null) insertData.longitude = user.longitude;

  const { data, error } = await supabase
    .from('farmer_listings')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    // If location or lat/long column is missing before table migration, retry with base columns
    if (error.message.includes('column') || error.code === '42703') {
      delete insertData.location;
      delete insertData.latitude;
      delete insertData.longitude;
      const retry = await supabase.from('farmer_listings').insert([insertData]).select().single();
      if (retry.error) throw new Error(retry.error.message);
      return {
        ...mapListing(retry.data),
        location: body.location || user.location || 'Pune, Maharashtra',
      };
    }
    throw new Error(error.message);
  }
  return mapListing(data);
};

export const updateListing = async (id: string, body: Partial<Listing>): Promise<Listing> => {
  if (!supabase) throw new Error('Not connected');

  const updateData: any = {};
  if (body.product !== undefined) updateData.product = body.product;
  if (body.quantityKg !== undefined) {
    updateData.quantity_kg = body.quantityKg;
    updateData.available_qty_kg = body.quantityKg;
  }
  if (body.pricePerKg !== undefined) updateData.price_per_kg = body.pricePerKg;
  if (body.quality !== undefined) updateData.quality = body.quality;
  if (body.availableFrom !== undefined) updateData.available_from = body.availableFrom;
  if (body.delivery !== undefined) updateData.delivery = body.delivery;
  if (body.images !== undefined) updateData.images = body.images;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.latitude !== undefined) updateData.latitude = body.latitude;
  if (body.longitude !== undefined) updateData.longitude = body.longitude;

  const { data, error } = await supabase
    .from('farmer_listings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapListing(data);
};

export const deactivateListing = async (id: string): Promise<Listing> => {
  if (!supabase) throw new Error('Not connected');

  const { data, error } = await supabase
    .from('farmer_listings')
    .update({ status: 'Sold' }) // Mark as sold per requirements
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapListing(data);
};

export const deleteListing = async (id: string) => {
  if (!supabase) throw new Error('Not connected');

  const { error } = await supabase.from('farmer_listings').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  if (!supabase) return [];

  let query = supabase.from('farmer_listings').select('*').eq('status', 'Available');

  if (filters.search) {
    query = query.ilike('product', `%${filters.search}%`);
  }
  if (filters.quality) {
    query = query.eq('quality', filters.quality);
  }

  if (filters.sort === 'price') {
    query = query.order('price_per_kg', { ascending: true });
  } else if (filters.sort === 'quality') {
    query = query.order('quality', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Get farmer profiles for contact info
  const farmerIds = [...new Set((data || []).map(p => p.farmer_id))];
  const profilesMap: Record<string, any> = {};
  if (farmerIds.length > 0) {
    try {
      const { data: profiles } = await supabase.from('profiles').select('id, phone, email').in('id', farmerIds);
      if (profiles) {
        profiles.forEach((prof: any) => {
          profilesMap[prof.id] = prof;
        });
      }
    } catch (e) {
      console.warn('Failed to fetch farmer profiles:', e);
    }
  }

  // Get current session user for buyer distance calculation
  const currentUser = await getSessionUser();
  const buyerLat = currentUser?.latitude;
  const buyerLon = currentUser?.longitude;

  let products = (data || []).map((row) => {
    const p = mapProduct(row);
    if (profilesMap[p.farmerId]) {
      p.farmerPhone = profilesMap[p.farmerId].phone;
      p.farmerEmail = profilesMap[p.farmerId].email;
    }
    return p;
  }).map((p) => {
    if (buyerLat != null && buyerLon != null && p.latitude != null && p.longitude != null) {
      const dist = calculateDistanceKm(buyerLat, buyerLon, p.latitude, p.longitude);
      return { ...p, distanceKm: dist };
    }
    return p;
  });

  // Filter 50KM visibility range
  if (buyerLat != null && buyerLon != null) {
    products = products.filter(p => p.distanceKm == null || p.distanceKm <= 50);
  }

  if (filters.sort === 'distance' || !filters.sort) {
    products.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      
      // 10 KM Priority Range
      const aPriority = a.distanceKm <= 10;
      const bPriority = b.distanceKm <= 10;
      
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;

      return a.distanceKm - b.distanceKm;
    });
  }

  return products;
};

export const getProduct = async (id: string): Promise<Product> => {
  if (!supabase) throw new Error('Not connected');

  const { data, error } = await supabase
    .from('farmer_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const product = mapProduct(data);
  
  // fetch farmer contact info
  try {
    const { data: profile } = await supabase.from('profiles').select('phone, email').eq('id', product.farmerId).single();
    if (profile) {
      product.farmerPhone = profile.phone;
      product.farmerEmail = profile.email;
    }
  } catch (e) {
    console.warn('Could not load farmer profile for product', e);
  }

  const currentUser = await getSessionUser();
  if (currentUser?.latitude != null && currentUser?.longitude != null && product.latitude != null && product.longitude != null) {
    product.distanceKm = calculateDistanceKm(currentUser.latitude, currentUser.longitude, product.latitude, product.longitude);
  }

  return product;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error, falling back to data URL:', error);
      }
    } catch (e) {
      console.warn('Storage upload exception, falling back to data URL:', e);
    }
  }

  // Fallback to Data URL if storage bucket fails or client is offline/demo
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        resolve(ev.target.result as string);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

