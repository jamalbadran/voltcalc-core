import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Bot, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingPerformanceAnalyzer from './TradingPerformanceAnalyzer';
import TradingBotCard from './TradingBotCard';
import CreateBotForm from './CreateBotForm';
import TotalProfitCard from './TotalProfitCard';
import RiskManager from './RiskManager';
import BacktestingEngine from './BacktestingEngine';
import StrategyTemplates from './StrategyTemplates';
import PaperTradingMode from './PaperTradingMode';
import { useTradingHistory } from '@/hooks/useTradingHistory';
import { TradingBot, AutoTradingEngineProps } from '@/types/trading';
import { TechnicalIndicators } from '@/utils/technicalIndicators';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

const AutoTradingEngine = ({ cryptoList, onTrade }: AutoTradingEngineProps) => {
  const { toast } = useToast();
  const { tradeHistory, addTrade, getTotalProfit } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [isPaperMode, setIsPaperMode] = useState(true);
  
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

  const executeAdvancedTrading = (bot: TradingBot, crypto: any) => {
    const { change24h, price } = crypto;
    
    // Generate price history for technical analysis (simulated)
    const priceHistory = generatePriceHistory(crypto);
    const technicalSignals = TechnicalIndicators.generateTradingSignals(priceHistory);
    
    // Apply learning insights to modify trading behavior
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    // Enhanced strategy with market condition detection and technical indicators
    const marketCondition = detectMarketCondition(change24h);
    const volatility = Math.abs(change24h) / 100;
    
    // Combine technical signals with price action
    const shouldConsiderBuy = change24h <= adaptedThresholds.buyThreshold && 
                             (technicalSignals.overall === 'buy' || technicalSignals.confidence > 0.7);
    const shouldConsiderSell = change24h >= adaptedThresholds.sellThreshold && 
                              (technicalSignals.overall === 'sell' || technicalSignals.confidence > 0.7);
    
    const volatilityMultiplier = volatility > 0.05 ? 0.7 : 1.2;
    
    if (bot.strategy.includes('ai_')) {
      if (shouldConsiderBuy) {
        const riskFactor = Math.min(Math.abs(change24h) / 10, 0.6);
        const learningMultiplier = getLearningMultiplier(bot.id, 'buy');
        const technicalMultiplier = technicalSignals.confidence;
        const amount = bot.maxAmount * (0.03 + riskFactor) * learningMultiplier * technicalMultiplier;
        
        // Use paper trading if enabled
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
        
        // Use paper trading if enabled
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

  const generatePriceHistory = (crypto: any) => {
    // Simulate price history for technical analysis
    const history = [];
    let basePrice = crypto.price;
    
    for (let i = 50; i >= 0; i--) {
      const timeAgo = new Date(Date.now() - i * 3600000); // hourly data
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
  };

  const evaluateInsightEffectiveness = (insight: LearningInsight) => {
    const botTrades = tradeHistory.filter(trade => 
      trade.botId === insight.botId && 
      trade.timestamp >= insight.appliedAt
    );

    if (botTrades.length >= 3) {
      const avgProfit = botTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0) / botTrades.length;
      const effectivenessScore = Math.max(0, Math.min(1, (avgProfit + 10) / 20));

      setLearningInsights(prev => prev.map(i => 
        i.id === insight.id ? { ...i, effectivenessScore } : i
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

  const handleApplyTemplate = (template: any) => {
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: `${template.name} Bot`,
      strategy: `ai_${template.type}`,
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'BTC', // Default, can be changed
      buyThreshold: template.buyThreshold,
      sellThreshold: template.sellThreshold,
      maxAmount: template.maxAmount,
      learningEnabled: true
    };
    
    createBot(newBot);
  };

  const handleRiskViolation = (botId: string, reason: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, isActive: false } : bot
    ));
    
    toast({
      title: 'Risk Limit Violated',
      description: `Bot ${botId} stopped: ${reason}`,
      variant: 'destructive'
    });
  };

  const handleStrategyOptimization = (optimizedStrategy: any) => {
    toast({
      title: 'Strategy Optimization Complete',
      description: `New optimal parameters discovered through backtesting`,
    });
  };

  const getTotalPortfolioValue = () => {
    return cryptoList.reduce((total, crypto) => total + crypto.price, 0);
  };

  return (
    <div className="space-y-6">
      {/* Paper Trading Mode */}
      <PaperTradingMode 
        onModeChange={setIsPaperMode}
        cryptoList={cryptoList}
      />

      {/* Risk Management */}
      <RiskManager 
        onRiskViolation={handleRiskViolation}
        totalPortfolioValue={getTotalPortfolioValue()}
      />

      {/* Strategy Templates */}
      <StrategyTemplates onApplyTemplate={handleApplyTemplate} />

      {/* Backtesting Engine */}
      <BacktestingEngine onStrategyOptimization={handleStrategyOptimization} />

      {/* Enhanced AI Performance Analysis */}
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
          Advanced AI Trading Bots
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
