
import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface TotalProfitCardProps {
  totalProfit: number;
}

const TotalProfitCard = ({ totalProfit }: TotalProfitCardProps) => {
  return (
    <Card className="trading-card p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          <span className="font-semibold">Total AI Profit</span>
        </div>
        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
        </div>
      </div>
    </Card>
  );
};

export default TotalProfitCard;
