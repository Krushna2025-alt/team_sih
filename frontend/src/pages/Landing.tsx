import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, Mic, Sprout, Tractor, ShieldCheck, Search, Handshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { getProducts } from '../services/listingService';
import { formatCurrency, formatKg } from '../utils/format';
import { productEmoji } from '../utils/constants';
import { Badge, Card, Spinner } from '../components/common/ui';
export default function Landing() {
const { t } = useTranslation();
const { lang, setLang } = useLanguage();
const { data: recent, isLoading } = useQuery({
queryKey: ['products', 'landing'],
queryFn: () => getProducts({ sort: 'newest' }),
staleTime: 60_000,
});
return (
<div className="min-h-screen bg-surface">
<header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
<div className="flex items-center gap-2">
<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-farmer text-white"><Sprout size={20} /></span>
<span className="text-lg font-bold text-gray-900">KrishiLink</span>
</div>
<div className="flex items-center gap-2">
<select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language"
className="touch rounded-lg border border-gray-300 bg-white px-2 text-sm">
<option value="en">EN</option><option value="mr">MR</option><option value="hi">HI</option>
</select>
<Link to="/login" className="touch rounded-lg px-3 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100">{t('common.login')}</Link>
<Link to="/signup" className="touch rounded-lg bg-farmer px-3 py-2 text-[15px] font-medium text-white hover:bg-farmer-dark">{t('common.signup')}</Link>
</div>
</header>
 <section className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center sm:pt-14"> 
 <h1 className="text-2xl font-extrabold text-gray-900 sm:text-4xl">{t('landing.heroTitle')}</h1> 
 <p className="mt-3 text-base text-gray-600 sm:text-lg">{t('landing.heroSubtitle')}</p> 
 <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2"> 
 <Link to="/signup?role=farmer" className="rounded-2xl border-2 border-farmer bg-white p-6 text-left shadow-sm transition hover:bg-farmer-light"> 
 <Tractor className="text-farmer" size={32} /> 
 <h2 className="mt-2 text-lg font-bold">{t('landing.iamFarmer')}</h2> 
 <p className="mt-1 text-sm text-gray-600">{t('landing.farmerDesc')}</p> 
 <span className="mt-4 inline-flex touch items-center gap-2 rounded-lg bg-farmer px-4 py-2.5 text-[15px] font-medium text-white"> 
 <Mic size={18} /> {t('landing.voiceCta')} 
 </span> 
 </Link> 
 <Link to="/signup?role=buyer" className="rounded-2xl border-2 border-buyer bg-white p-6 text-left shadow-sm transition hover:bg-buyer-light"> 
 <Building2 className="text-buyer" size={32} /> 
 <h2 className="mt-2 text-lg font-bold">{t('landing.iamBuyer')}</h2> 
 <p className="mt-1 text-sm text-gray-600">{t('landing.buyerDesc')}</p> 
 <span className="mt-4 inline-flex touch items-center gap-2 rounded-lg bg-buyer px-4 py-2.5 text-[15px] font-medium text-white"> 
 {t('common.browse')} <ArrowRight size={16} /> 
 </span> 
 </Link> 
 </div> 
 </section>

 <section className="mx-auto max-w-5xl px-4 pb-12">
   <div className="rounded-3xl bg-white p-8 shadow-sm">
     <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">How It Works</h2>
     <div className="mt-8 grid gap-8 sm:grid-cols-3">
       <div className="text-center">
         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
           <ShieldCheck size={32} />
         </div>
         <h3 className="mt-4 text-lg font-bold text-gray-900">1. Register & Verify</h3>
         <p className="mt-2 text-sm text-gray-600">Sign up as a farmer or buyer. Complete your profile and get verified for secure trading.</p>
       </div>
       <div className="text-center">
         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
           <Search size={32} />
         </div>
         <h3 className="mt-4 text-lg font-bold text-gray-900">2. List or Search</h3>
         <p className="mt-2 text-sm text-gray-600">Farmers can use voice listings to add products. Buyers can search nearby produce.</p>
       </div>
       <div className="text-center">
         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
           <Handshake size={32} />
         </div>
         <h3 className="mt-4 text-lg font-bold text-gray-900">3. Trade Directly</h3>
         <p className="mt-2 text-sm text-gray-600">Connect, negotiate bulk deals, and trade directly with zero middlemen.</p>
       </div>
     </div>
   </div>
 </section>

 <section className="mx-auto max-w-5xl px-4 pb-12"> 
 <h2 className="mb-4 text-lg font-bold text-gray-900">{t('landing.recentListings')}</h2> 
 {isLoading ? ( 
 <div className="flex justify-center py-8"><Spinner /></div> 
 ) : ( 
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"> 
 {(recent ?? []).slice(0, 4).map((p) => ( 
 <Card key={p.id}> 
 <div className="flex h-20 items-center justify-center rounded-lg bg-farmer-light text-3xl">{productEmoji(p.product)}</div> 
 <h3 className="mt-2 font-semibold">{p.product}</h3> 
 <p className="font-bold text-farmer-dark">{formatCurrency(p.pricePerKg)}/kg</p> 
 <p className="text-sm text-gray-500"> 
 {formatKg(p.availableQtyKg)} &middot; {p.distanceKm ?? '—'} {t('common.km')} 
 </p> 
 <Badge tone="gray">{t('common.quality')} {p.quality}</Badge> 
 </Card> 
 ))} 
 </div> 
 )} 
 </section>
 <footer className="border-t bg-white px-4 py-6 text-center text-sm text-gray-500"> 
 <div className="flex flex-wrap justify-center gap-4"> 
 <a href="#" className="hover:underline">{t('landing.about')}</a> 
 <a href="#" className="hover:underline">{t('landing.contact')}</a> 
 <a href="#" className="hover:underline">{t('landing.terms')}</a> 
 <a href="#" className="hover:underline">{t('landing.privacy')}</a> 
 </div> 
 <p className="mt-2">&copy; {new Date().getFullYear()} KrishiLink</p> 
 </footer> 
</div> 
);
}
