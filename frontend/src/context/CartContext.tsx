import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../types';
export interface CartItem { product: Product; qtyKg: number; }
interface CartCtx {
items: CartItem[];
add: (p: Product, qtyKg: number) => void;
setQty: (id: string, qtyKg: number) => void;
remove: (id: string) => void;
clear: () => void;
count: number;
subtotal: number;
}
const Ctx = createContext<CartCtx>(null as unknown as CartCtx);
const KEY = 'krishilink_cart';
export function CartProvider({ children }: { children: ReactNode }) {
const [items, setItems] = useState<CartItem[]>(() => {
try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
});
useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
const add = (p: Product, qtyKg: number) =>
setItems((prev) => {
const ex = prev.find((i) => i.product.id === p.id);
if (ex) return prev.map((i) => (i.product.id === p.id ? { ...i, qtyKg: Math.min(i.qtyKg + qtyKg, 
p.availableQtyKg) } : i));
return [...prev, { product: p, qtyKg }];
});
const setQty = (id: string, qtyKg: number) =>
setItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, qtyKg: Math.max(1, Math.min(qtyKg, 
i.product.availableQtyKg)) } : i)));
const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));
const clear = () => setItems([]);
const subtotal = useMemo(() => items.reduce((s, i) => s + i.qtyKg * i.product.pricePerKg, 0), 
[items]);
return (
<Ctx.Provider value={{ items, add, setQty, remove, clear, count: items.length, subtotal }}>
{children}
</Ctx.Provider>
);
}
export const useCart = () => useContext(Ctx);
export const estimateDeliveryFee = (subtotal: number) => (subtotal === 0 || subtotal >= 5000 ? 0 : 200);
