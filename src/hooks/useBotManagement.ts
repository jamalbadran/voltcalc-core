
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot } from '@/types/trading';
import { CryptoCurrency } from '@/components/trading/types';

export const useBotManagement = (
  cryptoList: CryptoCurrency[],
  autonomousMode: boolean,
  isPaperMode: boolean
) => {
  const { toast } = useToast();
  
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'Bitcoin AI Trader',
      strategy: 'ai_momentum',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000,
      learningEnabled: true
    },
    {
      id: '2',
      name: 'Ethereum Smart Bot',
      strategy: 'ai_grid',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 800,
      learningEnabled: true
    },
    {
      id: '3',
      name: 'Altcoin Opportunity Scout',
      strategy: 'ai_adaptive',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: 'ADA',
      buyThreshold: -2.5,
      sellThreshold: 4.0,
      maxAmount: 500,
      learningEnabled: true
    },
    {
      id: '4',
      name: 'Top 10 Volatility Hunter',
      strategy: 'ai_volatility',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: 'SOL',
      buyThreshold: -3.0,
      sellThreshold: 5.0,
      maxAmount: 600,
      learningEnabled: true
    }
  ]);

  const createAutonomousAltcoinBot = (crypto: CryptoCurrency) => {
    const strategies = ['ai_momentum', 'ai_scalping', 'ai_swing', 'ai_grid'];
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: `${crypto.symbol} Auto-Trader`,
      strategy: randomStrategy,
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: crypto.symbol,
      buyThreshold: crypto.change24h > 0 ? -1.8 : -3.2,
      sellThreshold: crypto.change24h > 0 ? 2.5 : 4.5,
      maxAmount: Math.min(700, Math.max(200, Math.abs(crypto.change24h) * 120)),
      learningEnabled: true
    };

    setBots(prev => [...prev, newBot]);
    
    console.log(`🤖 AI created new ${crypto.symbol} trading bot with ${randomStrategy} strategy`);
    
    if (!isPaperMode) {
      toast({
        title: 'AI Altcoin Bot Created',
        description: `AI detected ${crypto.symbol} opportunity and deployed a new trading bot`,
      });
    }
  };

  const createMultiAssetBot = () => {
    const topVolatileCoins = cryptoList
      .filter(crypto => Math.abs(crypto.change24h) > 2)
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 3);

    if (topVolatileCoins.length > 0) {
      const selectedCoin = topVolatileCoins[0];
      
      const newBot: TradingBot = {
        id: Date.now().toString(),
        name: 'Multi-Altcoin AI Hunter',
        strategy: 'ai_multi_asset',
        isActive: true,
        profit: 0,
        trades: 0,
        symbol: selectedCoin.symbol,
        buyThreshold: -2.2,
        sellThreshold: 3.8,
        maxAmount: 800,
        learningEnabled: true
      };

      setBots(prev => [...prev, newBot]);
      
      console.log(`🎯 AI created multi-asset bot starting with ${selectedCoin.symbol}`);
    }
  };

  const switchBotToAltcoin = (botId: string, newCrypto: CryptoCurrency) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        console.log(`🔄 ${bot.name} switching from ${bot.symbol} to ${newCrypto.symbol}`);
        
        return {
          ...bot,
          symbol: newCrypto.symbol,
          name: `${newCrypto.symbol} ${bot.strategy.replace('ai_', '').toUpperCase()} Bot`,
          buyThreshold: newCrypto.change24h > 0 ? -1.5 : -3.0,
          sellThreshold: newCrypto.change24h > 0 ? 2.0 : 4.0
        };
      }
      return bot;
    }));

    if (!isPaperMode) {
      toast({
        title: 'AI Altcoin Switch',
        description: `Bot switched to ${newCrypto.symbol} for better opportunities`,
      });
    }
  };

  const updateBotStats = (botId: string, action: 'buy' | 'sell', amount: number, price: number, profit = 0) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const profitChange = action === 'sell' ? (profit || 0) : -amount * 0.001;
        return {
          ...bot,
          trades: bot.trades + 1,
          profit: bot.profit + profitChange
        };
      }
      return bot;
    }));
  };

  // Enhanced autonomous bot creation for any top 10 altcoin
  useEffect(() => {
    if (!autonomousMode) return;

    const creationInterval = setInterval(() => {
      const untappedCryptos = cryptoList.filter(crypto => 
        !bots.some(bot => bot.symbol === crypto.symbol) && 
        Math.abs(crypto.change24h) > 2.5
      );

      if (untappedCryptos.length > 0 && bots.length < 12) {
        const bestOpportunity = untappedCryptos.reduce((best, current) => 
          Math.abs(current.change24h) > Math.abs(best.change24h) ? current : best
        );

        createAutonomousAltcoinBot(bestOpportunity);
      }

      if (bots.length < 8 && Math.random() > 0.7) {
        createMultiAssetBot();
      }
    }, 240000);

    return () => clearInterval(creationInterval);
  }, [autonomousMode, bots, cryptoList]);

  return {
    bots,
    setBots,
    createAutonomousAltcoinBot,
    createMultiAssetBot,
    switchBotToAltcoin,
    updateBotStats
  };
};
