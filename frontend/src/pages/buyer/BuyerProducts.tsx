import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/listingService';
import { qk } from '../../utils/constants';
import { PageHeader, Input, Select, PageLoading, ErrorState, EmptyState } from '../../components/common/ui';
import ProductCard from '../../components/buyer/ProductCard';

export default function BuyerProducts() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'distance');

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: qk.products({ search, sort }),
    queryFn: () => getProducts({ search, sort: sort as 'distance' | 'price' | 'quality' | 'newest' }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search, sort });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setSearchParams({ search, sort: e.target.value });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('buyer.marketplace')} subtitle="Browse available crops directly from farmers." />
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <Input 
            placeholder={t('common.search')} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </form>
        <div className="w-full sm:w-48">
          <Select value={sort} onChange={handleSortChange}>
            <option value="distance">Nearest First</option>
            <option value="price">Lowest Price</option>
            <option value="quality">Highest Quality</option>
            <option value="newest">Newest</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <PageLoading />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !products?.length ? (
        <EmptyState title="No products found" subtitle="Try adjusting your search criteria." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      )}
    </div>
  );
}
