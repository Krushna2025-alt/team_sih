import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getBuyerDashboard } from '../../services/dashboardService';
import { getProducts } from '../../services/listingService';
import { qk, productEmoji } from '../../utils/constants';
import { PageHeader, StatCard, Card, PageLoading, ErrorState } from '../../components/common/ui';
import { ShoppingCart, Star, Box, Leaf } from 'lucide-react';
import ProductCard from '../../components/buyer/ProductCard';
import { useNavigate } from 'react-router-dom';

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: qk.dashboard('buyer'),
    queryFn: getBuyerDashboard,
  });

  const { data: availableListings } = useQuery({
    queryKey: ['available-listings'],
    queryFn: () => getProducts({ sort: 'newest' }),
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title={t('dashboard.overview')} subtitle="Welcome back! Here's a summary of your procurement." />
        <button 
          onClick={() => navigate('/buyer/products')} 
          className="bg-buyer hover:bg-buyer-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {t('buyer.browseProducts')}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('buyer.activeOrders')} value={stats.activeOrders} tone="buyer" />
        <StatCard label={t('buyer.monthlySpend')} value={`₹${stats.monthlySpending}`} tone="buyer" />
        <StatCard label={t('buyer.savedFarmers')} value={stats.savedFarmers} tone="buyer" />
        <StatCard label={t('buyer.totalSourced')} value={`${stats.monthlyProcurementKg} kg`} tone="buyer" />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('buyer.recommendedFarmers')}</h2>
          <button onClick={() => navigate('/buyer/products')} className="text-sm font-semibold text-buyer hover:underline">
            {t('common.viewAll')}
          </button>
        </div>
        
        {stats.recommendedFarmers.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-500">No recommended farmers found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.recommendedFarmers.map((farmer) => (
              <Card key={farmer.id} className="p-4 flex flex-col items-center text-center hover:border-buyer cursor-pointer transition-colors" onClick={() => navigate(`/buyer/products?search=${farmer.name}`)}>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-3">
                  {productEmoji(farmer.topProduct)}
                </div>
                <h3 className="font-bold text-gray-900">{farmer.name}</h3>
                <p className="text-sm text-gray-500">{farmer.distanceKm} km away</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">{farmer.rating}</span>
                  <span className="text-xs text-gray-400 ml-1">Reliability: {farmer.reliability}%</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 border-t pt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-800">Available Farmer Listings</h2>
          <button onClick={() => navigate('/buyer/products')} className="text-sm font-semibold text-buyer hover:underline">
            View All
          </button>
        </div>
        
        {availableListings && availableListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableListings.slice(0, 8).map((product) => (
              <ProductCard key={product.id} p={product} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No active listings available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
