import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
BarChart3, Bell, ClipboardList, FileText, Layers, LayoutDashboard, LogOut, Menu,
MessageCircle, Mic, Package, Scale, Settings, ShieldCheck, ShoppingBag, Sprout, Store, Target,
UserCircle2, Users, Wallet, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { qk } from '../../utils/constants';
import * as notifSvc from '../../services/notificationService';
import { isDemo } from '../../services/supabaseClient';
import type { LucideIcon } from 'lucide-react';
interface L { to: string; key: string; icon: LucideIcon }
function LanguageSelect() {
const { t } = useTranslation();
const { lang, setLang } = useLanguage();
return (
<select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('common.language')}
className="touch rounded-lg border border-gray-300 bg-white px-2 text-sm">
<option value="en">EN</option>
<option value="mr">MR</option>
<option value="hi">HI</option>
</select>
);
}
function NotificationBell() {
const { t } = useTranslation();
const nav = useNavigate();
const { user } = useAuth();
const qc = useQueryClient();
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);
const { data } = useQuery({
queryKey: qk.notifications(),
queryFn: notifSvc.getNotifications,
enabled: !!user,
refetchInterval: 60_000,
});
const markRead = useMutation({
mutationFn: notifSvc.markRead,
onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
});
const items = (data ?? []).slice(0, 5);
const unread = (data ?? []).filter((n) => !n.read).length;
useEffect(() => {
const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) 
setOpen(false); };
document.addEventListener('mousedown', h);
return () => document.removeEventListener('mousedown', h);
}, []);
return (
<div className="relative" ref={ref}>
<button onClick={() => setOpen((o) => !o)} className="touch relative rounded-lg p-2 hover:bg-gray-100" aria-label={t('nav.notifications')}>
<Bell size={20} />
{unread > 0 && (
<span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
{unread}
</span>
)}
</button>
{open && (
<div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border bg-white p-2 shadow-lg">
{items.length === 0 ? (
<p className="p-3 text-sm text-gray-500">{t('notifications.empty')}</p>
) : (
items.map((n) => (
<button key={n.id}
onClick={() => { if (!n.read) markRead.mutate(n.id); setOpen(false); nav(`/${user!.role}/notifications`); }}
className={`block w-full rounded-lg p-2 text-left hover:bg-gray-50 ${!n.read ? 'bg-farmer-light' : ''}`}
>
<p className="text-sm font-medium">{n.title}</p>
<p className="truncate text-xs text-gray-500">{n.body}</p>
</button>
))
)}
</div>
)}
</div>
);
}
function ProfileMenu() {
const { t } = useTranslation();
const { user, signOut } = useAuth();
const nav = useNavigate();
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) 
setOpen(false); };
document.addEventListener('mousedown', h);
return () => document.removeEventListener('mousedown', h);
}, []);
if (!user) return null;
return (
<div className="relative" ref={ref}>
<button onClick={() => setOpen((o) => !o)} className="touch flex items-center gap-2 rounded-lg 
p-2 hover:bg-gray-100" aria-label={t('nav.profile')}>
<UserCircle2 size={22} />
<span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">{user.name}
</span>
</button>
{open && (
<div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border bg-white p-2 shadow-lg">
<p className="px-2 py-1 text-xs text-gray-400">{user.role}</p>
<Link to={`/${user.role}/profile`} onClick={() => setOpen(false)}
className="touch flex items-center gap-2 rounded-lg px-2 hover:bg-gray-100">
<UserCircle2 size={16} /> {t('nav.profile')}
</Link>
<button onClick={async () => { await signOut(); nav('/'); }}
className="touch flex w-full items-center gap-2 rounded-lg px-2 text-red-600 hover:bg-red-50">
<LogOut size={16} /> {t('common.logout')}
</button>
</div>
)}
</div>
);
}
export default function Navbar() {
const { t } = useTranslation();
const { user } = useAuth();
const { count } = useCart();
const [open, setOpen] = useState(false);
if (!user) return null;
const links: L[] =
user.role === 'farmer'
? [
{ to: '/farmer/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
{ to: '/farmer/listings', key: 'nav.listings', icon: Package },
{ to: '/farmer/listings/voice', key: 'nav.voiceListing', icon: Mic },
{ to: '/farmer/orders', key: 'nav.orders', icon: ClipboardList },
{ to: '/farmer/earnings', key: 'nav.earnings', icon: Wallet },
{ to: '/farmer/demands', key: 'nav.demands', icon: Target },
{ to: '/farmer/bulk-deals', key: 'nav.bulkDeals', icon: Layers },
{ to: '/farmer/monthly-discussion', key: 'nav.monthlyDiscussion', icon: MessageCircle },
]
: user.role === 'buyer'
? [
{ to: '/buyer/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
{ to: '/buyer/products', key: 'nav.browse', icon: Store },
{ to: '/buyer/cart', key: 'nav.cart', icon: ShoppingBag },
{ to: '/buyer/orders', key: 'nav.orders', icon: ClipboardList },
{ to: '/buyer/demands', key: 'nav.demands', icon: FileText },
{ to: '/buyer/procurement', key: 'nav.procurement', icon: Target },
{ to: '/buyer/bulk-deals', key: 'nav.bulkDeals', icon: Layers },
]
: [
{ to: '/admin/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
{ to: '/admin/users', key: 'nav.users', icon: Users },
{ to: '/admin/verifications', key: 'nav.verifications', icon: ShieldCheck },
{ to: '/admin/listings', key: 'nav.listings', icon: Package },
{ to: '/admin/orders', key: 'nav.orders', icon: ClipboardList },
{ to: '/admin/disputes', key: 'nav.disputes', icon: Scale },
{ to: '/admin/analytics', key: 'nav.analytics', icon: BarChart3 },
{ to: '/admin/settings', key: 'nav.settings', icon: Settings },
];
const activeBg = user.role === 'farmer' ? 'bg-farmer' : user.role === 'buyer' ? 'bg-buyer' : 'bg-gray-800';
const linkCls = ({ isActive }: { isActive: boolean }) =>
`touch flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium ${ isActive ? 
`${activeBg} text-white` : 'text-gray-700 hover:bg-gray-100' }`;
return (
<header className="sticky top-0 z-30 border-b bg-white">
<div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
<div className="flex items-center gap-2">
<button className="touch rounded-lg p-2 hover:bg-gray-100 lg:hidden" onClick={() => 
setOpen((o) => !o)} aria-label="Menu">
{open ? <X size={22} /> : <Menu size={22} />}
</button>
<Link to={`/${user.role}/dashboard`} className="flex items-center gap-2">
<span className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeBg} text-white`}
><Sprout size={20} /></span>
<span className="text-lg font-bold text-gray-900">KrishiLink</span>
</Link>
{isDemo && <span className="hidden rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent sm:block">{t('common.demoMode')}</span>}
</div>
<div className="flex items-center gap-1">
<LanguageSelect />
<NotificationBell />
<ProfileMenu />
</div>
</div>
 <nav className="hidden border-t lg:block"> 
 <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-1"> 
 {links.map((l) => ( 
 <NavLink key={l.to} to={l.to} className={linkCls}> 
 <l.icon size={17} /> {t(l.key)} 
 </NavLink> 
 ))} 
 {user.role === 'buyer' && count > 0 && ( 
 <span className="ml-auto self-center rounded-full bg-accent px-2 py-0.5 text-xs font-bold 
text-white"> 
 {t('nav.cart')}: {count} 
 </span> 
 )} 
 </div> 
 </nav>
 {open && ( 
 <nav className="border-t p-2 lg:hidden"> 
 {links.map((l) => ( 
 <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkCls}> 
 <l.icon size={17} /> {t(l.key)} 
 {l.key === 'nav.cart' && count > 0 && ( 
 <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{count}</span> 
 )} 
 </NavLink> 
 ))} 
 </nav> 
 )} 
</header> 
);
}
