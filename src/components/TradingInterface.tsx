
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from './trading/Header';
import CryptoList from './trading/CryptoList';
import PortfolioCard from './trading/PortfolioCard';
import PriceDisplay from './trading/PriceDisplay';
import TradingPanel from './trading/TradingPanel';
import { CryptoCurrency, PortfolioItem } from './trading/types';

const TradingInterface = () => {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>({
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.80,
    change24h: 2.45,
    volume: 28500000000
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
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

  return (
    <div className="min-h-screen p-4 space-y-6">
      <Header currentTime={currentTime} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market Overview */}
        <div className="lg:col-span-1 space-y-4">
          <CryptoList 
            cryptoList={cryptoList}
            selectedCrypto={selectedCrypto}
            onSelectCrypto={setSelectedCrypto}
          />
          <PortfolioCard portfolio={portfolio} />
        </div>

        {/* Main Trading Area */}
        <div className="lg:col-span-3 space-y-6">
          <PriceDisplay selectedCrypto={selectedCrypto} />
          <TradingPanel 
            cryptoList={cryptoList}
            selectedCrypto={selectedCrypto}
            onTrade={handleAutonomousTrade}
          />
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
