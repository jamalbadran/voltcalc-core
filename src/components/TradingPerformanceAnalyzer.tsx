
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target, BookOpen } from 'lucide-react';

interface TradeRecord {
  id: string;
  botId: string;
  action: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  timestamp: Date;
  profit?: number;
  marketCondition?: 'bullish' | 'bearish' | 'neutral';
  volatility?: number;
}

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenesScore?: number;
}

interface BotPerformance {
  botId: string;
  winRate: number;
  totalProfit: number;
  avgProfitPerTrade: number;
  bestStrategy: {
    buyThreshold: number;
    sellThreshold: number;
  };
  confidence: number;
  learningInsights: LearningInsight[];
  adaptationScore: number;
}

interface TradingPerformanceAnalyzerProps {
  tradeHistory: TradeRecord[];
  onStrategyUpdate: (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => void;
  onLearningInsight: (botId: string, insight: LearningInsight) => void;
}

const TradingPerformanceAnalyzer = ({ tradeHistory, onStrategyUpdate, onLearningInsight }: TradingPerformanceAnalyzerProps) => {
  const [performances, setPerformances] = useState<BotPerformance[]>([]);
  const [learningCycle, setLearningCycle] = useState(0);

  useEffect(() => {
    if (tradeHistory.length > 0) {
      analyzePerformanceWithLearning();
    }
  }, [tradeHistory]);

  // Enhanced learning cycle that runs every minute
  useEffect(() => {
    const learningInterval = setInterval(() => {
      setLearningCycle(prev => prev + 1);
      if (performances.length > 0) {
        performDeepLearning();
      }
    }, 60000); // Run learning cycle every minute

    return () => clearInterval(learningInterval);
  }, [performances]);

  const analyzePerformanceWithLearning = () => {
    const botPerformances: { [key: string]: BotPerformance } = {};
    
    // Group trades by bot
    const tradesByBot = tradeHistory.reduce((acc, trade) => {
      if (!acc[trade.botId]) acc[trade.botId] = [];
      acc[trade.botId].push(trade);
      return acc;
    }, {} as { [key: string]: TradeRecord[] });

    Object.entries(tradesByBot).forEach(([botId, trades]) => {
      if (trades.length < 4) return;

      const profitable = trades.filter(t => (t.profit || 0) > 0);
      const winRate = profitable.length / trades.length;
      const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
      const avgProfitPerTrade = totalProfit / trades.length;

      // Enhanced strategy optimization with market condition awareness
      const bestStrategy = optimizeStrategyWithContext(trades);
      const confidence = calculateDynamicConfidence(trades, winRate, avgProfitPerTrade);
      
      // Generate learning insights
      const insights = generateLearningInsights(botId, trades);
      const adaptationScore = calculateAdaptationScore(trades);

      botPerformances[botId] = {
        botId,
        winRate,
        totalProfit,
        avgProfitPerTrade,
        bestStrategy,
        confidence,
        learningInsights: insights,
        adaptationScore
      };

      // Apply learned strategies with higher confidence threshold
      if (confidence > 0.7 && trades.length > 15 && adaptationScore > 0.6) {
        onStrategyUpdate(botId, bestStrategy);
        
        // Share the best insight
        if (insights.length > 0) {
          onLearningInsight(botId, insights[0]);
        }
      }
    });

    setPerformances(Object.values(botPerformances));
  };

  const performDeepLearning = () => {
    performances.forEach(perf => {
      if (perf.learningInsights.length > 0) {
        // Evaluate effectiveness of previous insights
        const effectiveInsights = perf.learningInsights.filter(insight => 
          (insight.effectivenesScore || 0) > 0.5
        );

        if (effectiveInsights.length > 2) {
          // Generate new meta-learning insight
          const metaInsight: LearningInsight = {
            id: `meta-${Date.now()}`,
            botId: perf.botId,
            insight: `Learned to prioritize ${effectiveInsights[0].insight.toLowerCase()} strategies in current market conditions`,
            confidence: 0.8,
            appliedAt: new Date(),
            effectivenesScore: effectiveInsights.reduce((sum, i) => sum + (i.effectivenesScore || 0), 0) / effectiveInsights.length
          };

          onLearningInsight(perf.botId, metaInsight);
        }
      }
    });
  };

  const generateLearningInsights = (botId: string, trades: TradeRecord[]): LearningInsight[] => {
    const insights: LearningInsight[] = [];
    const recentTrades = trades.slice(-10); // Last 10 trades
    
    // Pattern recognition
    const consecutiveLosses = getConsecutiveLosses(recentTrades);
    if (consecutiveLosses >= 3) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        botId,
        insight: "Detected losing streak - should reduce position sizes and wait for better market conditions",
        confidence: 0.8,
        appliedAt: new Date()
      });
    }

    // Volatility adaptation
    const avgVolatility = recentTrades.reduce((sum, t) => sum + (t.volatility || 0), 0) / recentTrades.length;
    if (avgVolatility > 0.05) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        botId,
        insight: "High volatility detected - should widen stop-loss and take-profit margins",
        confidence: 0.75,
        appliedAt: new Date()
      });
    }

    // Time-based patterns
    const profitableHours = analyzeProfitableTimePatterns(recentTrades);
    if (profitableHours.length > 0) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        botId,
        insight: `Most profitable trading during hours: ${profitableHours.join(', ')} - should focus activity in these periods`,
        confidence: 0.7,
        appliedAt: new Date()
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  };

  const optimizeStrategyWithContext = (trades: TradeRecord[]): { buyThreshold: number; sellThreshold: number } => {
    const strategies = [];
    const recentTrades = trades.slice(-20);
    
    // Analyze market conditions from recent trades
    const bullishTrades = recentTrades.filter(t => t.marketCondition === 'bullish');
    const bearishTrades = recentTrades.filter(t => t.marketCondition === 'bearish');
    
    const marketBias = bullishTrades.length > bearishTrades.length ? 'bullish' : 'bearish';
    
    // Adjust threshold ranges based on market conditions
    const buyRange = marketBias === 'bullish' ? [-3, -0.5] : [-6, -1];
    const sellRange = marketBias === 'bullish' ? [0.5, 4] : [1, 6];
    
    for (let buyThreshold = buyRange[0]; buyThreshold <= buyRange[1]; buyThreshold += 0.3) {
      for (let sellThreshold = sellRange[0]; sellThreshold <= sellRange[1]; sellThreshold += 0.3) {
        const profit = simulateContextualStrategy(trades, buyThreshold, sellThreshold, marketBias);
        strategies.push({ buyThreshold, sellThreshold, profit });
      }
    }

    const best = strategies.reduce((a, b) => a.profit > b.profit ? a : b);
    return { buyThreshold: best.buyThreshold, sellThreshold: best.sellThreshold };
  };

  const simulateContextualStrategy = (trades: TradeRecord[], buyThreshold: number, sellThreshold: number, marketBias: string): number => {
    let totalProfit = 0;
    let position = 0;
    let avgBuyPrice = 0;

    trades.forEach(trade => {
      const marketChange = (trade.profit || 0) / trade.amount * 100;
      const volatilityAdjustment = (trade.volatility || 0) * 100;
      
      // Apply market bias and volatility adjustments
      const adjustedBuyThreshold = buyThreshold + (marketBias === 'bearish' ? -0.5 : 0.5) + volatilityAdjustment;
      const adjustedSellThreshold = sellThreshold + (marketBias === 'bullish' ? 0.5 : -0.5) - volatilityAdjustment;
      
      if (trade.action === 'buy' && marketChange <= adjustedBuyThreshold) {
        position += trade.amount;
        avgBuyPrice = ((avgBuyPrice * (position - trade.amount)) + (trade.price * trade.amount)) / position;
      } else if (trade.action === 'sell' && marketChange >= adjustedSellThreshold && position > 0) {
        const sellAmount = Math.min(trade.amount, position);
        const profit = (trade.price - avgBuyPrice) * sellAmount;
        totalProfit += profit;
        position -= sellAmount;
      }
    });

    return totalProfit;
  };

  const calculateDynamicConfidence = (trades: TradeRecord[], winRate: number, avgProfit: number): number => {
    const tradeCount = trades.length;
    const recentPerformance = trades.slice(-5).reduce((sum, t) => sum + (t.profit || 0), 0) / 5;
    const consistency = 1 - (Math.abs(avgProfit - recentPerformance) / Math.max(Math.abs(avgProfit), 1));
    
    return Math.min(
      (winRate * 0.4) + 
      (Math.min(avgProfit / 50, 1) * 0.3) + 
      (Math.min(tradeCount / 50, 1) * 0.2) + 
      (consistency * 0.1), 
      1
    );
  };

  const calculateAdaptationScore = (trades: TradeRecord[]): number => {
    if (trades.length < 10) return 0;
    
    const earlyTrades = trades.slice(0, Math.floor(trades.length / 2));
    const lateTrades = trades.slice(Math.floor(trades.length / 2));
    
    const earlyWinRate = earlyTrades.filter(t => (t.profit || 0) > 0).length / earlyTrades.length;
    const lateWinRate = lateTrades.filter(t => (t.profit || 0) > 0).length / lateTrades.length;
    
    return Math.max(0, lateWinRate - earlyWinRate + 0.5); // Bonus for improvement
  };

  const getConsecutiveLosses = (trades: TradeRecord[]): number => {
    let consecutive = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if ((trades[i].profit || 0) <= 0) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  };

  const analyzeProfitableTimePatterns = (trades: TradeRecord[]): number[] => {
    const hourlyProfits: { [hour: number]: number[] } = {};
    
    trades.forEach(trade => {
      const hour = trade.timestamp.getHours();
      if (!hourlyProfits[hour]) hourlyProfits[hour] = [];
      hourlyProfits[hour].push(trade.profit || 0);
    });

    const profitableHours: number[] = [];
    Object.entries(hourlyProfits).forEach(([hour, profits]) => {
      const avgProfit = profits.reduce((sum, p) => sum + p, 0) / profits.length;
      if (avgProfit > 0 && profits.length >= 3) {
        profitableHours.push(parseInt(hour));
      }
    });

    return profitableHours.sort((a, b) => a - b);
  };

  return (
    <Card className="trading-card p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-500" />
        AI Self-Learning Performance Analysis
        <Badge variant="outline" className="ml-2 text-xs">
          Cycle #{learningCycle}
        </Badge>
      </h3>
      
      {performances.length === 0 ? (
        <p className="text-center opacity-60 py-8">
          Collecting data... Need at least 4 trades per bot for analysis
        </p>
      ) : (
        <div className="space-y-4">
          {performances.map(perf => (
            <div key={perf.botId} className="p-4 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold flex items-center">
                    Bot {perf.botId}
                    {perf.adaptationScore > 0.6 && (
                      <BookOpen className="w-3 h-3 ml-2 text-blue-400" title="Actively Learning" />
                    )}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="opacity-60">Win Rate:</span>
                    <Badge variant={perf.winRate > 0.6 ? "default" : "secondary"}>
                      {(perf.winRate * 100).toFixed(1)}%
                    </Badge>
                    <span className="opacity-60">Adaptation:</span>
                    <Badge variant={perf.adaptationScore > 0.6 ? "default" : "outline"}>
                      {(perf.adaptationScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-lg ${perf.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {perf.totalProfit >= 0 ? '+' : ''}${perf.totalProfit.toFixed(2)}
                  </div>
                  <div className="text-xs opacity-60">
                    Avg: ${perf.avgProfitPerTrade.toFixed(2)}/trade
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="opacity-60">AI Confidence:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${perf.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs">{(perf.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <span className="opacity-60">Optimized Strategy:</span>
                  <div className="text-xs mt-1">
                    Buy: {perf.bestStrategy.buyThreshold.toFixed(1)}% | Sell: {perf.bestStrategy.sellThreshold.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Learning Insights */}
              {perf.learningInsights.length > 0 && (
                <div className="bg-blue-900/20 p-3 rounded mt-3">
                  <h5 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
                    <Brain className="w-3 h-3 mr-1" />
                    Latest Learning Insights
                  </h5>
                  {perf.learningInsights.slice(0, 2).map(insight => (
                    <div key={insight.id} className="text-xs opacity-80 mb-1 flex items-start">
                      <Target className="w-2 h-2 mr-1 mt-1 flex-shrink-0" />
                      <span>{insight.insight}</span>
                      <Badge variant="outline" className="ml-2 text-xs h-4">
                        {(insight.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {perf.confidence > 0.7 && perf.adaptationScore > 0.6 && (
                <div className="mt-3 flex items-center text-xs text-green-400">
                  <Target className="w-3 h-3 mr-1" />
                  Strategy auto-optimized and actively learning from market patterns
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TradingPerformanceAnalyzer;
