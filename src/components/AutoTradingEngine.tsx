import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Bot, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingPerformanceAnalyzer from './TradingPerformanceAnalyzer';
import TradingBotCard from './TradingBotCard';
import CreateBotForm from './CreateBotForm';
import TotalProfitCard from './TotalProfitCard';
import { useTradingHistory } from '@/hooks/useTradingHistory';
import { TradingBot, AutoTradingEngineProps } from '@/types/trading';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenesScore?: number;
}

const AutoTradingEngine = ({ cryptoList, onTrade }: AutoTradingEngineProps) => {
  const { toast } = useToast();
  const { tradeHistory, addTrade, getTotalProfit } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'BTC AI Trader',
      strategy: 'ai_momentum',
      isActive: false,
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
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 500,
      learningEnabled: true
    }
  ]);

  // Enhanced autonomous trading logic with self-improvement
  useEffect(() => {
    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeAdaptiveTrading(bot, crypto);
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bots, cryptoList, learningInsights]);

  const executeAdaptiveTrading = (bot: TradingBot, crypto: any) => {
    const { change24h, price } = crypto;
    
    // Apply learning insights to modify trading behavior
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    // Enhanced strategy with market condition detection
    const marketCondition = detectMarketCondition(change24h);
    const volatility = Math.abs(change24h) / 100;
    
    const volatilityMultiplier = volatility > 0.05 ? 0.7 : 1.2;
    const adjustedBuyThreshold = adaptedThresholds.buyThreshold * volatilityMultiplier;
    const adjustedSellThreshold = adaptedThresholds.sellThreshold * volatilityMultiplier;
    
    if (bot.strategy.includes('ai_')) {
      if (change24h <= adjustedBuyThreshold) {
        const riskFactor = Math.min(Math.abs(change24h) / 10, 0.6);
        const learningMultiplier = getLearningMultiplier(bot.id, 'buy');
        const amount = bot.maxAmount * (0.03 + riskFactor) * learningMultiplier;
        
        onTrade('buy', bot.symbol, amount);
        
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
          title: `${bot.name} - Adaptive AI Buy`,
          description: `Smart buy: $${amount.toFixed(2)} of ${bot.symbol} (${change24h.toFixed(2)}% change, ${marketCondition} market)`,
        });
        
      } else if (change24h >= adjustedSellThreshold) {
        const profitFactor = Math.min(change24h / 10, 0.4);
        const learningMultiplier = getLearningMultiplier(bot.id, 'sell');
        const amount = bot.maxAmount * (0.03 + profitFactor) * learningMultiplier;
        const sellAmount = amount / price;
        
        onTrade('sell', bot.symbol, sellAmount);
        
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
          title: `${bot.name} - Adaptive AI Sell`,
          description: `Smart sell: ${sellAmount.toFixed(6)} ${bot.symbol} for $${estimatedProfit.toFixed(2)} profit (${marketCondition} market)`,
        });
      }
    }
  };

  const applyLearningInsights = (bot: TradingBot, marketData: { change24h: number; price: number }) => {
    const botInsights = learningInsights.filter(insight => insight.botId === bot.id);
    let adjustedBuyThreshold = bot.buyThreshold;
    let adjustedSellThreshold = bot.sellThreshold;

    botInsights.forEach(insight => {
      if (insight.confidence > 0.7) {
        if (insight.insight.includes('losing streak')) {
          // Be more conservative
          adjustedBuyThreshold *= 1.3;
          adjustedSellThreshold *= 0.8;
        } else if (insight.insight.includes('High volatility')) {
          // Widen margins
          adjustedBuyThreshold *= 1.2;
          adjustedSellThreshold *= 1.2;
        } else if (insight.insight.includes('profitable trading during')) {
          const currentHour = new Date().getHours();
          const profitableHours = extractHoursFromInsight(insight.insight);
          if (profitableHours.includes(currentHour)) {
            // Be more aggressive during profitable hours
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
        return daysSinceApplied < 7; // Only recent insights
      });

    const effectiveInsights = recentInsights.filter(insight => (insight.effectivenesScore || 0) > 0.6);
    
    if (effectiveInsights.length > 0) {
      return 1 + (effectiveInsights.length * 0.1); // Up to 20% boost for effective learning
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

  const handleStrategyUpdate = (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId && bot.learningEnabled) {
        toast({
          title: 'AI Strategy Self-Optimized',
          description: `${bot.name} learned from performance and adapted its strategy`,
        });
        return {
          ...bot,
          buyThreshold: strategy.buyThreshold,
          sellThreshold: strategy.sellThreshold
        };
      }
      return bot;
    }));
  };

  const handleLearningInsight = (botId: string, insight: LearningInsight) => {
    setLearningInsights(prev => {
      const updated = [...prev, insight];
      // Keep only the last 50 insights to prevent memory issues
      return updated.slice(-50);
    });

    // Calculate effectiveness of previous insights
    setTimeout(() => {
      evaluateInsightEffectiveness(insight);
    }, 300000); // Evaluate after 5 minutes

    toast({
      title: 'AI Learning Update',
      description: `Bot ${botId}: ${insight.insight.substring(0, 60)}...`,
      duration: 3000,
    });
  };

  const evaluateInsightEffectiveness = (insight: LearningInsight) => {
    const botTrades = tradeHistory.filter(trade => 
      trade.botId === insight.botId && 
      trade.timestamp >= insight.appliedAt
    );

    if (botTrades.length >= 3) {
      const avgProfit = botTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0) / botTrades.length;
      const effectivenessScore = Math.max(0, Math.min(1, (avgProfit + 10) / 20)); // Normalize to 0-1

      setLearningInsights(prev => prev.map(i => 
        i.id === insight.id ? { ...i, effectivenesScore } : i
      ));

      console.log(`Insight effectiveness for ${insight.botId}: ${effectivenessScore.toFixed(2)}`);
    }
  };

  const toggleBot = (botId: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const newActive = !bot.isActive;
        toast({
          title: newActive ? 'AI Bot Activated' : 'AI Bot Deactivated',
          description: `${bot.name} is now ${newActive ? 'learning and trading' : 'stopped'}`,
        });
        return { ...bot, isActive: newActive };
      }
      return bot;
    }));
  };

  const createBot = (newBot: TradingBot) => {
    setBots(prev => [...prev, newBot]);
    toast({
      title: 'New AI Trading Bot Created',
      description: `${newBot.name} is ready to learn and trade`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced AI Performance Analysis with Self-Learning */}
      <TradingPerformanceAnalyzer 
        tradeHistory={tradeHistory}
        onStrategyUpdate={handleStrategyUpdate}
        onLearningInsight={handleLearningInsight}
      />

      {/* Total Profit Summary */}
      <TotalProfitCard totalProfit={getTotalProfit()} />

      {/* Active Learning Insights Summary */}
      {learningInsights.length > 0 && (
        <Card className="trading-card p-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-blue-500" />
            Recent AI Learning Insights
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {learningInsights.slice(-5).reverse().map(insight => (
              <div key={insight.id} className="text-sm bg-blue-900/20 p-2 rounded">
                <div className="flex justify-between items-start">
                  <span className="opacity-80">{insight.insight}</span>
                  <span className="text-xs text-blue-400 ml-2">
                    Bot {insight.botId} • {insight.confidence.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Bots */}
      <Card className="trading-card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-500" />
          Self-Learning AI Trading Bots
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {bots.map(bot => (
            <TradingBotCard
              key={bot.id}
              bot={bot}
              onToggle={toggleBot}
            />
          ))}
        </div>
      </Card>

      {/* Create New Bot */}
      <CreateBotForm
        cryptoList={cryptoList}
        onCreateBot={createBot}
      />
    </div>
  );
};

export default AutoTradingEngine;
