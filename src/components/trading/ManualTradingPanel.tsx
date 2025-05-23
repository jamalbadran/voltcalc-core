
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

interface ManualTradingPanelProps {
  selectedCrypto: CryptoCurrency;
}

const ManualTradingPanel = ({ selectedCrypto }: ManualTradingPanelProps) => {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const handleBuy = () => {
    if (buyAmount) {
      console.log(`Buying ${buyAmount} USD worth of ${selectedCrypto.symbol}`);
      setBuyAmount('');
    }
  };

  const handleSell = () => {
    if (sellAmount) {
      console.log(`Selling ${sellAmount} ${selectedCrypto.symbol}`);
      setSellAmount('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buy Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-400 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Buy {selectedCrypto.symbol}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm opacity-60 block mb-2">
              Amount (USD)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-green-500"
            />
          </div>
          {buyAmount && (
            <div className="text-sm opacity-60">
              ≈ {(parseFloat(buyAmount) / selectedCrypto.price).toFixed(6)} {selectedCrypto.symbol}
            </div>
          )}
          <Button 
            onClick={handleBuy}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            disabled={!buyAmount}
          >
            Buy {selectedCrypto.symbol}
          </Button>
        </div>
      </div>

      {/* Sell Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-400 flex items-center">
          <TrendingDown className="w-5 h-5 mr-2" />
          Sell {selectedCrypto.symbol}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm opacity-60 block mb-2">
              Amount ({selectedCrypto.symbol})
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-red-500"
            />
          </div>
          {sellAmount && (
            <div className="text-sm opacity-60">
              ≈ {formatCurrency(parseFloat(sellAmount) * selectedCrypto.price)}
            </div>
          )}
          <Button 
            onClick={handleSell}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
            disabled={!sellAmount}
          >
            Sell {selectedCrypto.symbol}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManualTradingPanel;
