
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot } from '@/types/trading';
import { TechnicalIndicators } from '@/utils/technicalIndicators';
import { useTradingHistory } from './useTradingHistory';
import { PerformanceAnalysis } from '@/utils/performanceAnalysis';
import { LearningEngine } from '@/utils/learningEngine';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

export const useFullyAutonomousTrading = (
  cryptoList: Array<{ symbol: string; name: string; price: number; change24h: number }>,
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void,
  isPaperMode: boolean
) => {
  const { toast } = useToast();
  const { addTrade, tradeHistory } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [lastOptimization, setLastOptimization] = useState(Date.now());

  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'BTC AI Trader',
      strategy: 'ai_momentum',
      isActive: true, // Start active for full autonomy
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
      name: 'ETH Smart Bot',
      strategy: 'ai_grid',
      isActive: true, // Start active for full autonomy
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 500,
      learningEnabled: true
    },
    {
      id: '3',
      name: 'Multi-Asset AI',
      strategy: 'ai_adaptive',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: 'ADA',
      buyThreshold: -2.5,
      sellThreshold: 4.0,
      maxAmount: 300,
      learningEnabled: true
    }
  ]);

  // Autonomous bot creation based on market opportunities
  useEffect(() => {
    if (!autonomousMode) return;

    const creationInterval = setInterval(() => {
      const availableSymbols = cryptoList.filter(crypto => 
        !bots.some(bot => bot.symbol === crypto.symbol) && 
        Math.abs(crypto.change24h) > 3 // High volatility opportunity
      );

      if (availableSymbols.length > 0 && bots.length < 8) {
        const bestOpportunity = availableSymbols.reduce((best, current) => 
          Math.abs(current.change24h) > Math.abs(best.change24h) ? current : best
        );

        createAutonomousBot(bestOpportunity);
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(creationInterval);
  }, [autonomousMode, bots, cryptoList]);

  // Continuous strategy optimization
  useEffect(() => {
    if (!autonomousMode) return;

    const optimizationInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastOptimization > 600000) { // 10 minutes
        performAutonomousOptimization();
        setLastOptimization(now);
      }
    }, 60000); // Check every minute

    return () => clearInterval(optimizationInterval);
  }, [autonomousMode, lastOptimization, tradeHistory]);

  // Enhanced autonomous trading with self-learning
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
    }, 3000); // More frequent for full autonomy

    return () => clearInterval(interval);
  }, [bots, cryptoList, learningInsights, isPaperMode, autonomousMode]);

  // Autonomous learning cycle
  useEffect(() => {
    if (!autonomousMode) return;

    const learningInterval = setInterval(() => {
      performDeepLearning();
    }, 180000); // Every 3 minutes

    return () => clearInterval(learningInterval);
  }, [autonomousMode, tradeHistory]);

  const createAutonomousBot = (crypto: any) => {
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: `${crypto.symbol} Auto-AI`,
      strategy: 'ai_autonomous',
      isActive: true,
      profit: 0,
      trades: 0,
      symbol: crypto.symbol,
      buyThreshold: crypto.change24h > 0 ? -1.5 : -3.0,
      sellThreshold: crypto.change24h > 0 ? 2.0 : 4.0,
      maxAmount: Math.min(500, Math.abs(crypto.change24h) * 100),
      learningEnabled: true
    };

    setBots(prev => [...prev, newBot]);
    
    toast({
      title: 'Autonomous Bot Created',
      description: `AI detected opportunity in ${crypto.symbol} and created a new trading bot`,
    });
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

  const executeFullyAutonomousTrading = (bot: TradingBot, crypto: any) => {
    const { change24h, price } = crypto;
    
    const priceHistory = generatePriceHistory(crypto);
    const technicalSignals = TechnicalIndicators.generateTradingSignals(priceHistory);
    
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    const marketCondition = detectMarketCondition(change24h);
    const volatility = Math.abs(change24h) / 100;
    
    const autonomyMultiplier = 1.2; // More aggressive for full autonomy
    const confidenceThreshold = 0.5; // Lower threshold for more activity
    
    const shouldBuy = change24h <= adaptedThresholds.buyThreshold && 
                     (technicalSignals.overall === 'buy' || technicalSignals.confidence > confidenceThreshold);
    const shouldSell = change24h >= adaptedThresholds.sellThreshold && 
                      (technicalSignals.overall === 'sell' || technicalSignals.confidence > confidenceThreshold);
    
    if (shouldBuy) {
      const riskFactor = Math.min(Math.abs(change24h) / 8, 0.8);
      const amount = bot.maxAmount * (0.05 + riskFactor) * autonomyMultiplier * technicalSignals.confidence;
      
      executeTrade(bot, 'buy', amount, price, crypto, marketCondition, volatility);
      
    } else if (shouldSell) {
      const profitFactor = Math.min(change24h / 8, 0.6);
      const amount = bot.maxAmount * (0.05 + profitFactor) * autonomyMultiplier * technicalSignals.confidence;
      const sellAmount = amount / price;
      
      executeTrade(bot, 'sell', sellAmount, price, crypto, marketCondition, volatility);
    }
  };

  const executeTrade = (bot: TradingBot, action: 'buy' | 'sell', amount: number, price: number, crypto: any, marketCondition: any, volatility: number) => {
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

  const generatePriceHistory = (crypto: any) => {
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
      return updated.slice(-100); // Keep more insights for full autonomy
    });
  }, []);

  const toggleAutonomousMode = () => {
    setAutonomousMode(prev => {
      const newMode = !prev;
      if (newMode) {
        // Activate all bots when entering autonomous mode
        setBots(prev => prev.map(bot => ({ ...bot, isActive: true })));
        toast({
          title: 'Full Autonomous Mode Activated',
          description: 'AI will now trade completely independently with continuous learning',
        });
      } else {
        toast({
          title: 'Autonomous Mode Deactivated',
          description: 'Manual control restored',
        });
      }
      return newMode;
    });
  };

  return {
    bots,
    setBots,
    learningInsights,
    autonomousMode,
    toggleAutonomousMode,
    handleLearningInsight
  };
};
