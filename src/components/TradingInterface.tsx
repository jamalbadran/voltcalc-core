
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBinancePrices } from '@/hooks/useBinancePrices';
import Header from './trading/Header';
import CryptoList from './trading/CryptoList';
import PortfolioCard from './trading/PortfolioCard';
import PriceDisplay from './trading/PriceDisplay';
import TradingPanel from './trading/TradingPanel';
import { PortfolioItem } from './trading/types';

const TradingInterface = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { cryptoList, isConnected } = useBinancePrices();

  const [selectedCrypto, setSelectedCrypto] = useState(cryptoList[0]);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: 'BTC', amount: 0.5, value: 21625.40 },
    { symbol: 'ETH', amount: 5.2, value: 13520.00 },
    { symbol: 'ADA', amount: 1000, value: 650.00 }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update selected crypto when crypto list changes
  useEffect(() => {
    if (cryptoList.length > 0) {
      setSelectedCrypto(prev => {
        const updated = cryptoList.find(c => c.symbol === prev.symbol);
        return updated || cryptoList[0];
      });
    }
  }, [cryptoList]);

  // Update portfolio values based on live prices
  useEffect(() => {
    setPortfolio(prev => prev.map(item => {
      const crypto = cryptoList.find(c => c.symbol === item.symbol);
      if (crypto) {
        return {
          ...item,
          value: item.amount * crypto.price
        };
      }
      return item;
    }));
  }, [cryptoList]);

  // Show connection status
  useEffect(() => {
    if (isConnected) {
      toast({
        title: 'Live Prices Connected',
        description: 'Now showing real-time Binance prices',
      });
    }
  }, [isConnected]);

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
    <div className="min-h-screen p-2 md:p-4 space-y-4 md:space-y-6 pb-safe">
      <Header currentTime={currentTime} />

      <div className={`grid gap-4 md:gap-6 ${
        isMobile 
          ? 'grid-cols-1' 
          : 'grid-cols-1 lg:grid-cols-4'
      }`}>
        {/* Market Overview */}
        <div className={`space-y-4 ${isMobile ? 'order-2' : 'lg:col-span-1'}`}>
          <CryptoList 
            cryptoList={cryptoList}
            selectedCrypto={selectedCrypto}
            onSelectCrypto={setSelectedCrypto}
          />
          <PortfolioCard portfolio={portfolio} />
        </div>

        {/* Main Trading Area */}
        <div className={`space-y-4 md:space-y-6 ${isMobile ? 'order-1' : 'lg:col-span-3'}`}>
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
