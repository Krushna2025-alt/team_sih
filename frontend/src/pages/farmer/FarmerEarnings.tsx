import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getFarmerDashboard } from '../../services/dashboardService';
import { qk } from '../../utils/constants';
import { PageHeader, StatCard, Card, PageLoading, ErrorState } from '../../components/common/ui';
import WeeklyChart from '../../components/common/WeeklyChart';
import { Wallet, TrendingUp, Package, Clock } from 'lucide-react';

export default function FarmerEarnings() {
  const { t } = useTranslation();
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: qk.dashboard('farmer'),
    queryFn: getFarmerDashboard,
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.earnings')} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue}`} tone="farmer" />
        <StatCard label="Active Listings" value={stats.activeListings} tone="farmer" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} tone="farmer" />
        <StatCard label="Rating" value={`${stats.rating} / 5`} tone="farmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart data={stats.weeklySales} />
        </div>
        
        <div className="space-y-4">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Recent Payouts</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b">
                <span>Aug 12, 2025</span>
                <span className="font-semibold text-green-700">₹14,500</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span>Aug 05, 2025</span>
                <span className="font-semibold text-green-700">₹8,200</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span>Jul 29, 2025</span>
                <span className="font-semibold text-green-700">₹11,000</span>
              </div>
            </div>
            <button className="text-sm font-semibold text-farmer mt-4 w-full text-center hover:underline">
              View All History
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
