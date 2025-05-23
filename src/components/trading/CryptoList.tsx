
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

interface CryptoListProps {
  cryptoList: CryptoCurrency[];
  selectedCrypto: CryptoCurrency;
  onSelectCrypto: (crypto: CryptoCurrency) => void;
}

const CryptoList = ({ cryptoList, selectedCrypto, onSelectCrypto }: CryptoListProps) => {
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
        <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
        Markets
      </h3>
      <div className="space-y-3">
        {cryptoList.map((crypto) => (
          <div
            key={crypto.symbol}
            className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-50 hover:bg-gray-700 ${
              selectedCrypto.symbol === crypto.symbol ? 'bg-gray-700' : ''
            }`}
            onClick={() => onSelectCrypto(crypto)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{crypto.symbol}</div>
                <div className="text-xs opacity-60">{crypto.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(crypto.price)}</div>
                <div className={`text-xs flex items-center ${
                  crypto.change24h >= 0 ? 'price-up' : 'price-down'
                }`}>
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(crypto.change24h).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CryptoList;
