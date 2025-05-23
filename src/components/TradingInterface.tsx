import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity } from 'lucide-react';
import AutoTradingEngine from './AutoTradingEngine';
import { useToast } from '@/hooks/use-toast';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

const TradingInterface = () => {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>({
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.80,
    change24h: 2.45,
    volume: 28500000000
  });

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [portfolio, setPortfolio] = useState([
    { symbol: 'BTC', amount: 0.5, value: 21625.40 },
    { symbol: 'ETH', amount: 5.2, value: 13520.00 },
    { symbol: 'ADA', amount: 1000, value: 650.00 }
  ]);

  const cryptoList: CryptoCurrency[] = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.80, change24h: 2.45, volume: 28500000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2600.50, change24h: -1.25, volume: 15200000000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.65, change24h: 5.80, volume: 1200000000 },
    { symbol: 'SOL', name: 'Solana', price: 98.75, change24h: 3.20, volume: 2800000000 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.25, change24h: -0.85, volume: 850000000 }
  ];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutonomousTrade = (action: 'buy' | 'sell', symbol: string, amount: number) => {
    const crypto = cryptoList.find(c => c.symbol === symbol);
    if (!crypto) return;

    if (action === 'buy') {
      const cryptoAmount = amount / crypto.price;
      setPortfolio(prev => {
        const existing = prev.find(p => p.symbol === symbol);
        if (existing) {
          return prev.map(p => 
            p.symbol === symbol 
              ? { ...p, amount: p.amount + cryptoAmount, value: p.value + amount }
              : p
          );
        } else {
          return [...prev, { symbol, amount: cryptoAmount, value: amount }];
        }
      });
      
      console.log(`AI Autonomous buy: ${cryptoAmount.toFixed(6)} ${symbol} for $${amount.toFixed(2)}`);
      
      toast({
        title: 'AI Trade Executed',
        description: `Bought ${cryptoAmount.toFixed(6)} ${symbol} for $${amount.toFixed(2)}`,
      });
      
    } else {
      const sellValue = amount * crypto.price;
      setPortfolio(prev => 
        prev.map(p => 
          p.symbol === symbol 
            ? { ...p, amount: Math.max(0, p.amount - amount), value: Math.max(0, p.value - sellValue) }
            : p
        ).filter(p => p.amount > 0.000001)
      );
      
      console.log(`AI Autonomous sell: ${amount.toFixed(6)} ${symbol} for $${sellValue.toFixed(2)}`);
      
      toast({
        title: 'AI Trade Executed',
        description: `Sold ${amount.toFixed(6)} ${symbol} for $${sellValue.toFixed(2)}`,
      });
    }
  };

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
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold trading-gradient bg-clip-text text-transparent">
            AI CryptoTrader Pro
          </h1>
          <p className="text-sm opacity-60">
            {currentTime.toLocaleString()} • Powered by Machine Learning
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Activity className="w-3 h-3 mr-1" />
            AI Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market Overview */}
        <div className="lg:col-span-1 space-y-4">
          {/* Markets card */}
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
                  onClick={() => setSelectedCrypto(crypto)}
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

          {/* Portfolio */}
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
        </div>

        {/* Main Trading Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Display */}
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
                <Badge className="bg-green-500/20 text-green-400 border-green-500">
                  AI Trading Active
                </Badge>
              </div>
            </div>
          </Card>

          {/* Trading Panel */}
          <Card className="trading-card p-6">
            <Tabs defaultValue="autonomous" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="autonomous" className="data-[state=active]:bg-gray-700">
                  AI Autonomous Trading
                </TabsTrigger>
                <TabsTrigger value="manual" className="data-[state=active]:bg-gray-700">
                  Manual Trading
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="autonomous" className="mt-6">
                <AutoTradingEngine 
                  cryptoList={cryptoList}
                  onTrade={handleAutonomousTrade}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-6">
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
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
