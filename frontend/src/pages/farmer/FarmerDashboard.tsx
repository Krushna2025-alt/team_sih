import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layers, Mic, Package, Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getFarmerDashboard } from '../../services/dashboardService';
import { qk } from '../../utils/constants';
import { formatCurrency, formatKg } from '../../utils/format';
import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatCard } from '../../components/common/ui';
import WeeklyChart from '../../components/common/WeeklyChart';
export default function FarmerDashboard() {
const { t } = useTranslation();
const { user } = useAuth();
const { data, isLoading, error, refetch } = useQuery({ queryKey: qk.dashboard('farmer'), queryFn: 
getFarmerDashboard });
if (isLoading) return <PageLoading />;
if (error || !data) return <ErrorState error={error} onRetry={refetch} />;
const s = data;
return (
<div className="space-y-6">
<PageHeader title={t('nav.dashboard')} subtitle={`${user?.name ?? ''} — ${t('farmerDash.welcome')}`} />
<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
<StatCard label={t('stats.activeListings')} value={s.activeListings} />
<StatCard label={t('stats.availableQty')} value={formatKg(s.availableQtyKg)} tone="buyer" />
<StatCard label={t('stats.orders')} value={s.orders} tone="accent" />
<StatCard label={t('stats.weeklyRevenue')} value={formatCurrency(s.weeklyRevenue)} tone="neutral" />
</div>
 <Card> 
 <h2 className="mb-3 font-semibold">{t('farmerDash.quickActions')}</h2> 
 <div className="flex flex-wrap gap-3"> 
 <Link to="/farmer/listings/new"><Button><Plus size={18} />{t('farmerDash.addProduct')}</Button></Link> 
 <Link to="/farmer/listings/voice"><Button tone="accent"><Mic size={18} />{t('nav.voiceListing')}</Button></Link> 
 <Link to="/farmer/orders"><Button tone="outline"><Package size={18} />{t('nav.orders')}</Button></Link> 
 <Link to="/farmer/earnings"><Button tone="outline"><Wallet size={18} />{t('nav.earnings')}</Button></Link> 
 </div> 
 </Card>
 <div className="grid gap-4 lg:grid-cols-2"> 
 <Card> 
 <h2 className="mb-3 font-semibold">{t('stats.weeklySales')}</h2> 
 <WeeklyChart data={s.weeklySales} /> 
 </Card> 
 <Card className="flex flex-col justify-between"> 
 <div> 
 <div className="mb-2 flex items-center justify-between"> 
 <h2 className="font-semibold">{t('stats.nearbyDemand')}</h2> 
 <Link to="/farmer/demands" className="text-sm text-buyer hover:underline">{t('common.viewAll')}</Link> 
 </div> 
 {s.nearbyDemand === 0 ? ( 
 <p className="text-sm text-gray-500">{t('farmerDash.noDemand')}</p> 
 ) : ( 
 <p className="text-3xl font-bold text-farmer-dark">{s.nearbyDemand}</p> 
 )} 
 </div> 
 <Link to="/farmer/bulk-deals" className="mt-4"> 
 <Button tone="outline" className="w-full sm:w-auto"><Layers size={18} />{t('farmerDash.bulkOpportunities')} ({s.bulkOpportunities})</Button> 
 </Link> 
 </Card> 
 </div>
 {s.activeListings === 0 && ( 
 <EmptyState title={t('listings.empty')} subtitle={t('listings.emptyHint')} 
 action={<Link to="/farmer/listings/new"><Button>{t('farmerDash.addProduct')}</Button></Link>} /> 
 )} 
</div> 
);
}
