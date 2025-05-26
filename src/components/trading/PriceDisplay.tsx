
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

interface PriceDisplayProps {
  selectedCrypto: CryptoCurrency;
}

const PriceDisplay = ({ selectedCrypto }: PriceDisplayProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return (
    <Card className="trading-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {selectedCrypto.name} ({selectedCrypto.symbol})
          </h2>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(selectedCrypto.price)}
          </div>
          <div className={`flex items-center text-lg ${
            selectedCrypto.change24h >= 0 ? 'price-up' : 'price-down'
          }`}>
            {selectedCrypto.change24h >= 0 ? (
              <TrendingUp className="w-5 h-5 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-2" />
            )}
            {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <h3 className="text-sm opacity-60 mb-2">24h Volume</h3>
          <div className="text-xl font-semibold">
            {formatVolume(selectedCrypto.volume)}
          </div>
        </div>
        <div>
          <h3 className="text-sm opacity-60 mb-2">Market Status</h3>
          <div className="space-y-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              Live Binance Prices
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
              AI Trading Active
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceDisplay;
