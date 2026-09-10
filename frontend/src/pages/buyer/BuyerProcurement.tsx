import { useTranslation } from 'react-i18next';
import { PageHeader, Card, Button } from '../../components/common/ui';
import { useNavigate } from 'react-router-dom';
import { Target, FileText, Layers } from 'lucide-react';

export default function BuyerProcurement() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Procurement Hub" 
        subtitle="Centralized management for your sourcing operations." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center hover:border-buyer cursor-pointer transition-all" onClick={() => navigate('/buyer/demands')}>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">My Demands</h3>
          <p className="text-gray-500 text-sm mb-6 flex-grow">Post specific crop requirements and let farmers find you. Ideal for regular sized orders.</p>
          <Button className="w-full" tone="outline">Manage Demands</Button>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center hover:border-buyer cursor-pointer transition-all" onClick={() => navigate('/buyer/bulk-deals')}>
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Deals</h3>
          <p className="text-gray-500 text-sm mb-6 flex-grow">Browse and bid on large scale inventories directly from farmers. Perfect for wholesale procurement.</p>
          <Button className="w-full" tone="outline">View Bulk Deals</Button>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center hover:border-buyer cursor-pointer transition-all border-dashed" onClick={() => navigate('/buyer/products')}>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Sourcing</h3>
          <p className="text-gray-500 text-sm mb-6 flex-grow">Search the marketplace and buy directly from farmer listings for immediate delivery.</p>
          <Button className="w-full bg-buyer hover:bg-buyer-dark">Browse Marketplace</Button>
        </Card>
      </div>

      <Card className="p-6 mt-8 bg-buyer/5 border-none">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Procurement Analytics</h3>
        <p className="text-sm text-gray-600 mb-4">You have sourced 4,200 kg of materials this month, saving approximately ₹12,500 compared to standard mandi rates.</p>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-buyer w-3/4"></div>
        </div>
        <p className="text-xs font-semibold text-gray-500 mt-2 text-right">75% of Monthly Target Reached</p>
      </Card>
    </div>
  );
}
