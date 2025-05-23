
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface PortfolioItem {
  symbol: string;
  amount: number;
  value: number;
}

interface PortfolioCardProps {
  portfolio: PortfolioItem[];
}

const PortfolioCard = ({ portfolio }: PortfolioCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="trading-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Wallet className="w-5 h-5 mr-2 text-blue-500" />
        Portfolio
      </h3>
      <div className="space-y-3">
        {portfolio.map((holding) => (
          <div key={holding.symbol} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{holding.symbol}</div>
              <div className="text-xs opacity-60">{holding.amount.toFixed(6)}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(holding.value)}</div>
            </div>
          </div>
        ))}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total Value</span>
            <span>{formatCurrency(portfolio.reduce((sum, h) => sum + h.value, 0))}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioCard;
