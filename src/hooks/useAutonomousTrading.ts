
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot, AutoTradingEngineProps } from '@/types/trading';
import { TechnicalIndicators } from '@/utils/technicalIndicators';
import { useTradingHistory } from './useTradingHistory';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

export const useAutonomousTrading = (
  bots: TradingBot[],
  cryptoList: Array<{ symbol: string; name: string; price: number; change24h: number }>,
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void,
  isPaperMode: boolean,
  setBots: React.Dispatch<React.SetStateAction<TradingBot[]>>
) => {
  const { toast } = useToast();
  const { addTrade } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);

  // Enhanced autonomous trading logic with technical indicators
  useEffect(() => {
    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeAdvancedTrading(bot, crypto);
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bots, cryptoList, learningInsights, isPaperMode]);

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
      if (insight.confidence > 0.7) {
        if (insight.insight.includes('losing streak')) {
          adjustedBuyThreshold *= 1.3;
          adjustedSellThreshold *= 0.8;
        } else if (insight.insight.includes('High volatility')) {
          adjustedBuyThreshold *= 1.2;
          adjustedSellThreshold *= 1.2;
        } else if (insight.insight.includes('profitable trading during')) {
          const currentHour = new Date().getHours();
          const profitableHours = extractHoursFromInsight(insight.insight);
          if (profitableHours.includes(currentHour)) {
            adjustedBuyThreshold *= 0.9;
            adjustedSellThreshold *= 0.9;
          }
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

  const getLearningMultiplier = (botId: string, action: 'buy' | 'sell'): number => {
    const recentInsights = learningInsights
      .filter(insight => insight.botId === botId)
      .filter(insight => {
        const daysSinceApplied = (Date.now() - insight.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceApplied < 7;
      });

    const effectiveInsights = recentInsights.filter(insight => (insight.effectivenessScore || 0) > 0.6);
    
    if (effectiveInsights.length > 0) {
      return 1 + (effectiveInsights.length * 0.1);
    }
    
    return 1;
  };

  const extractHoursFromInsight = (insight: string): number[] => {
    const hourMatch = insight.match(/hours: ([\d, ]+)/);
    if (hourMatch) {
      return hourMatch[1].split(', ').map(h => parseInt(h.trim()));
    }
    return [];
  };

  const executeAdvancedTrading = (bot: TradingBot, crypto: any) => {
    const { change24h, price } = crypto;
    
    const priceHistory = generatePriceHistory(crypto);
    const technicalSignals = TechnicalIndicators.generateTradingSignals(priceHistory);
    
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    const marketCondition = detectMarketCondition(change24h);
    const volatility = Math.abs(change24h) / 100;
    
    const shouldConsiderBuy = change24h <= adaptedThresholds.buyThreshold && 
                             (technicalSignals.overall === 'buy' || technicalSignals.confidence > 0.7);
    const shouldConsiderSell = change24h >= adaptedThresholds.sellThreshold && 
                              (technicalSignals.overall === 'sell' || technicalSignals.confidence > 0.7);
    
    if (bot.strategy.includes('ai_')) {
      if (shouldConsiderBuy) {
        const riskFactor = Math.min(Math.abs(change24h) / 10, 0.6);
        const learningMultiplier = getLearningMultiplier(bot.id, 'buy');
        const technicalMultiplier = technicalSignals.confidence;
        const amount = bot.maxAmount * (0.03 + riskFactor) * learningMultiplier * technicalMultiplier;
        
        if (isPaperMode) {
          (window as any).executePaperTrade?.('buy', bot.symbol, amount);
        } else {
          onTrade('buy', bot.symbol, amount);
        }
        
        addTrade({
          botId: bot.id,
          action: 'buy',
          symbol: bot.symbol,
          amount,
          price,
          marketCondition,
          volatility
        });
        
        updateBotStats(bot.id, 'buy', amount, price);
        
        toast({
          title: `${bot.name} - AI Enhanced Buy`,
          description: `${isPaperMode ? 'Paper' : 'Live'} buy: $${amount.toFixed(2)} of ${bot.symbol} (Tech: ${technicalSignals.overall}, Conf: ${(technicalSignals.confidence * 100).toFixed(0)}%)`,
        });
        
      } else if (shouldConsiderSell) {
        const profitFactor = Math.min(change24h / 10, 0.4);
        const learningMultiplier = getLearningMultiplier(bot.id, 'sell');
        const technicalMultiplier = technicalSignals.confidence;
        const amount = bot.maxAmount * (0.03 + profitFactor) * learningMultiplier * technicalMultiplier;
        const sellAmount = amount / price;
        
        if (isPaperMode) {
          (window as any).executePaperTrade?.('sell', bot.symbol, sellAmount);
        } else {
          onTrade('sell', bot.symbol, sellAmount);
        }
        
        const estimatedProfit = amount * 0.025 * (1 + profitFactor);
        
        addTrade({
          botId: bot.id,
          action: 'sell',
          symbol: bot.symbol,
          amount: sellAmount,
          price,
          profit: estimatedProfit,
          marketCondition,
          volatility
        });
        
        updateBotStats(bot.id, 'sell', amount, price, estimatedProfit);
        
        toast({
          title: `${bot.name} - AI Enhanced Sell`,
          description: `${isPaperMode ? 'Paper' : 'Live'} sell: ${sellAmount.toFixed(6)} ${bot.symbol} (Tech: ${technicalSignals.overall})`,
        });
      }
    }
  };

  const updateBotStats = (botId: string, action: 'buy' | 'sell', amount: number, price: number, profit = 0) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const profitChange = action === 'sell' ? profit : -amount * 0.001;
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
      return updated.slice(-50);
    });

    setTimeout(() => {
      evaluateInsightEffectiveness(insight);
    }, 300000);

    toast({
      title: 'AI Learning Update',
      description: `Bot ${botId}: ${insight.insight.substring(0, 60)}...`,
      duration: 3000,
    });
  }, [toast]);

  const evaluateInsightEffectiveness = (insight: LearningInsight) => {
    // Implementation would require access to trade history
    console.log(`Evaluating insight effectiveness for ${insight.botId}`);
  };

  return {
    learningInsights,
    handleLearningInsight
  };
};
