import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot } from '@/types/trading';
import { TechnicalIndicators } from '@/utils/technicalIndicators';
import { useTradingHistory } from './useTradingHistory';
import { PerformanceAnalysis } from '@/utils/performanceAnalysis';
import { LearningEngine } from '@/utils/learningEngine';
import { CryptoCurrency } from '@/components/trading/types';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

export const useFullyAutonomousTrading = (
  cryptoList: CryptoCurrency[],
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void,
  isPaperMode: boolean
) => {
  const { toast } = useToast();
  const { addTrade, tradeHistory } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [lastOptimization, setLastOptimization] = useState(Date.now());

  const [bots, setBots] = useState<TradingBot[]>([
    // Multi-asset trading bots for top altcoins
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

  // Enhanced autonomous bot creation for any top 10 altcoin
  useEffect(() => {
    if (!autonomousMode) return;

    const creationInterval = setInterval(() => {
      // Find untapped opportunities in top 10 altcoins
      const untappedCryptos = cryptoList.filter(crypto => 
        !bots.some(bot => bot.symbol === crypto.symbol) && 
        Math.abs(crypto.change24h) > 2.5 // Good volatility for trading
      );

      if (untappedCryptos.length > 0 && bots.length < 12) {
        // Pick the most volatile altcoin for maximum profit potential
        const bestOpportunity = untappedCryptos.reduce((best, current) => 
          Math.abs(current.change24h) > Math.abs(best.change24h) ? current : best
        );

        createAutonomousAltcoinBot(bestOpportunity);
      }

      // Also create multi-asset bots that can switch between altcoins
      if (bots.length < 8 && Math.random() > 0.7) {
        createMultiAssetBot();
      }
    }, 240000); // Check every 4 minutes for new opportunities

    return () => clearInterval(creationInterval);
  }, [autonomousMode, bots, cryptoList]);

  // Intelligent altcoin switching for maximum profits
  useEffect(() => {
    if (!autonomousMode) return;

    const switchingInterval = setInterval(() => {
      // Find bots that should switch to more profitable altcoins
      bots.forEach(bot => {
        if (bot.isActive && bot.learningEnabled) {
          const currentCrypto = cryptoList.find(c => c.symbol === bot.symbol);
          const betterOpportunity = findBetterAltcoinOpportunity(bot, currentCrypto);
          
          if (betterOpportunity && betterOpportunity.symbol !== bot.symbol) {
            switchBotToAltcoin(bot.id, betterOpportunity);
          }
        }
      });
    }, 180000); // Check every 3 minutes

    return () => clearInterval(switchingInterval);
  }, [autonomousMode, bots, cryptoList]);

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

  const findBetterAltcoinOpportunity = (bot: TradingBot, currentCrypto: CryptoCurrency | undefined) => {
    if (!currentCrypto) return null;

    const betterOptions = cryptoList.filter(crypto => {
      const volatilityScore = Math.abs(crypto.change24h);
      const currentVolatility = Math.abs(currentCrypto.change24h);
      
      // Switch if volatility is significantly higher and profitable
      return volatilityScore > currentVolatility + 1.5 && 
             volatilityScore > 3.0 &&
             crypto.volume > currentCrypto.volume * 0.8;
    });

    return betterOptions.length > 0 ? 
      betterOptions.reduce((best, current) => 
        Math.abs(current.change24h) > Math.abs(best.change24h) ? current : best
      ) : null;
  };

  const switchBotToAltcoin = (botId: string, newCrypto: CryptoCurrency) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        console.log(`🔄 ${bot.name} switching from ${bot.symbol} to ${newCrypto.symbol}`);
        
        return {
          ...bot,
          symbol: newCrypto.symbol,
          name: `${newCrypto.symbol} ${bot.strategy.replace('ai_', '').toUpperCase()} Bot`,
          // Adjust thresholds based on new altcoin volatility
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

  const generatePriceHistory = (crypto: CryptoCurrency) => {
    const history = [];
    let basePrice = crypto.price;
    
    for (let i = 50; i >= 0; i--) {
      const timeAgo = new Date(Date.now() - i * 3600000);
      const volatility = Math.random() * 0.02 - 0.01;
      basePrice = basePrice * (1 + volatility);
      
      history.push({
        price: basePrice,
        timestamp: timeAgo,
        volume: Math.random() * 1000000
      });
    }
    
    return history;
  };

  const applyLearningInsights = (bot: TradingBot, marketData: { change24h: number; price: number }) => {
    const botInsights = learningInsights.filter(insight => insight.botId === bot.id);
    let adjustedBuyThreshold = bot.buyThreshold;
    let adjustedSellThreshold = bot.sellThreshold;

    botInsights.forEach(insight => {
      if (insight.confidence > 0.6) {
        if (insight.insight.includes('losing streak')) {
          adjustedBuyThreshold *= 1.4;
          adjustedSellThreshold *= 0.7;
        } else if (insight.insight.includes('High volatility')) {
          adjustedBuyThreshold *= 1.3;
          adjustedSellThreshold *= 1.3;
        }
      }
    });

    return { buyThreshold: adjustedBuyThreshold, sellThreshold: adjustedSellThreshold };
  };

  const detectMarketCondition = (change24h: number): 'bullish' | 'bearish' | 'neutral' => {
    if (change24h > 2) return 'bullish';
    if (change24h < -2) return 'bearish';
    return 'neutral';
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

  const handleLearningInsight = useCallback((botId: string, insight: LearningInsight) => {
    setLearningInsights(prev => {
      const updated = [...prev, insight];
      return updated.slice(-100);
    });
  }, []);

  const toggleAutonomousMode = () => {
    setAutonomousMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setBots(prev => prev.map(bot => ({ ...bot, isActive: true })));
        toast({
          title: 'Altcoin AI Trading Activated',
          description: 'AI will now autonomously trade across all top 10 altcoins for maximum profits',
        });
      } else {
        toast({
          title: 'Autonomous Altcoin Trading Paused',
          description: 'Manual control restored',
        });
      }
      return newMode;
    });
  };

  const executeTrade = (bot: TradingBot, action: 'buy' | 'sell', amount: number, price: number, crypto: CryptoCurrency, marketCondition: any, volatility: number) => {
    if (isPaperMode) {
      (window as any).executePaperTrade?.(action, bot.symbol, amount);
    } else {
      onTrade(action, bot.symbol, amount);
    }
    
    const profit = action === 'sell' ? amount * price * 0.02 : undefined;
    
    addTrade({
      botId: bot.id,
      action,
      symbol: bot.symbol,
      amount,
      price,
      profit,
      marketCondition,
      volatility
    });
    
    updateBotStats(bot.id, action, amount, price, profit);
  };

  const performAutonomousOptimization = () => {
    if (tradeHistory.length < 20) return;

    const performances = PerformanceAnalysis.analyzeBotsPerformance(tradeHistory);
    
    performances.forEach(perf => {
      if (perf.confidence > 0.6 && perf.adaptationScore > 0.5) {
        setBots(prev => prev.map(bot => {
          if (bot.id === perf.botId) {
            return {
              ...bot,
              buyThreshold: perf.bestStrategy.buyThreshold,
              sellThreshold: perf.bestStrategy.sellThreshold
            };
          }
          return bot;
        }));
      }
    });

    // Remove underperforming bots autonomously
    setBots(prev => prev.filter(bot => {
      const performance = performances.find(p => p.botId === bot.id);
      if (performance && performance.totalProfit < -100 && performance.winRate < 0.3) {
        toast({
          title: 'Autonomous Bot Retirement',
          description: `${bot.name} was automatically retired due to poor performance`,
        });
        return false;
      }
      return true;
    }));
  };

  const performDeepLearning = () => {
    const performances = PerformanceAnalysis.analyzeBotsPerformance(tradeHistory);
    
    performances.forEach(perf => {
      const botTrades = tradeHistory.filter(t => t.botId === perf.botId);
      const insights = LearningEngine.generateLearningInsights(perf.botId, botTrades);
      
      insights.forEach(insight => {
        handleLearningInsight(perf.botId, insight);
      });
    });

    // Meta-learning: Learn from successful strategies across all bots
    const successfulBots = performances.filter(p => p.winRate > 0.7 && p.totalProfit > 50);
    if (successfulBots.length > 0) {
      applyMetaLearning(successfulBots);
    }
  };

  const applyMetaLearning = (successfulBots: any[]) => {
    const avgSuccessfulBuyThreshold = successfulBots.reduce((sum, bot) => 
      sum + bot.bestStrategy.buyThreshold, 0) / successfulBots.length;
    const avgSuccessfulSellThreshold = successfulBots.reduce((sum, bot) => 
      sum + bot.bestStrategy.sellThreshold, 0) / successfulBots.length;

    setBots(prev => prev.map(bot => {
      if (bot.learningEnabled && bot.trades > 5) {
        const currentPerf = successfulBots.find(p => p.botId === bot.id);
        if (!currentPerf || currentPerf.winRate < 0.5) {
          return {
            ...bot,
            buyThreshold: (bot.buyThreshold + avgSuccessfulBuyThreshold) / 2,
            sellThreshold: (bot.sellThreshold + avgSuccessfulSellThreshold) / 2
          };
        }
      }
      return bot;
    }));
  };

  const executeFullyAutonomousTrading = (bot: TradingBot, crypto: CryptoCurrency) => {
    const { change24h, price, volume } = crypto;
    
    const priceHistory = generatePriceHistory(crypto);
    const technicalSignals = TechnicalIndicators.generateTradingSignals(priceHistory);
    
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    // Enhanced altcoin-specific logic
    const isAltcoin = crypto.symbol !== 'BTC' && crypto.symbol !== 'ETH';
    const altcoinMultiplier = isAltcoin ? 1.3 : 1.0; // More aggressive for altcoins
    const volatilityBonus = Math.min(Math.abs(change24h) / 10, 0.5);
    
    const autonomyMultiplier = 1.2 + volatilityBonus;
    const confidenceThreshold = isAltcoin ? 0.4 : 0.5; // Lower threshold for altcoins
    
    const shouldBuy = change24h <= adaptedThresholds.buyThreshold && 
                     (technicalSignals.overall === 'buy' || technicalSignals.confidence > confidenceThreshold) &&
                     volume > 100000000; // Minimum liquidity check

    const shouldSell = change24h >= adaptedThresholds.sellThreshold && 
                      (technicalSignals.overall === 'sell' || technicalSignals.confidence > confidenceThreshold);
    
    if (shouldBuy) {
      const riskFactor = Math.min(Math.abs(change24h) / 8, 0.8);
      const amount = bot.maxAmount * (0.05 + riskFactor) * autonomyMultiplier * altcoinMultiplier * technicalSignals.confidence;
      
      executeTrade(bot, 'buy', amount, price, crypto, 'altcoin_opportunity', Math.abs(change24h));
      
    } else if (shouldSell) {
      const profitFactor = Math.min(change24h / 8, 0.6);
      const amount = bot.maxAmount * (0.05 + profitFactor) * autonomyMultiplier * altcoinMultiplier * technicalSignals.confidence;
      const sellAmount = amount / price;
      
      executeTrade(bot, 'sell', sellAmount, price, crypto, 'altcoin_profit', Math.abs(change24h));
    }
  };

  useEffect(() => {
    if (!autonomousMode) return;

    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeFullyAutonomousTrading(bot, crypto);
          }
        }
      });
    }, 2500); // Faster execution for altcoin opportunities

    return () => clearInterval(interval);
  }, [bots, cryptoList, learningInsights, isPaperMode, autonomousMode]);

  // Enhanced learning cycle for altcoins
  useEffect(() => {
    if (!autonomousMode) return;

    const learningInterval = setInterval(() => {
      performDeepLearning();
    }, 150000); // Every 2.5 minutes

    return () => clearInterval(learningInterval);
  }, [autonomousMode, tradeHistory]);

  // Continuous optimization for altcoin trading
  useEffect(() => {
    if (!autonomousMode) return;

    const optimizationInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastOptimization > 480000) { // 8 minutes
        performAutonomousOptimization();
        setLastOptimization(now);
      }
    }, 60000);

    return () => clearInterval(optimizationInterval);
  }, [autonomousMode, lastOptimization, tradeHistory]);

  return {
    bots,
    setBots,
    learningInsights,
    autonomousMode,
    toggleAutonomousMode,
    handleLearningInsight
  };
};
