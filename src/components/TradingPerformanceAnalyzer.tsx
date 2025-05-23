
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target } from 'lucide-react';

interface TradeRecord {
  id: string;
  botId: string;
  action: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  timestamp: Date;
  profit?: number;
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
}

interface TradingPerformanceAnalyzerProps {
  tradeHistory: TradeRecord[];
  onStrategyUpdate: (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => void;
}

const TradingPerformanceAnalyzer = ({ tradeHistory, onStrategyUpdate }: TradingPerformanceAnalyzerProps) => {
  const [performances, setPerformances] = useState<BotPerformance[]>([]);

  useEffect(() => {
    if (tradeHistory.length > 0) {
      analyzePerformance();
    }
  }, [tradeHistory]);

  const analyzePerformance = () => {
    const botPerformances: { [key: string]: BotPerformance } = {};
    
    // Group trades by bot
    const tradesByBot = tradeHistory.reduce((acc, trade) => {
      if (!acc[trade.botId]) acc[trade.botId] = [];
      acc[trade.botId].push(trade);
      return acc;
    }, {} as { [key: string]: TradeRecord[] });

    Object.entries(tradesByBot).forEach(([botId, trades]) => {
      if (trades.length < 4) return; // Need minimum trades for analysis

      const profitable = trades.filter(t => (t.profit || 0) > 0);
      const winRate = profitable.length / trades.length;
      const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
      const avgProfitPerTrade = totalProfit / trades.length;

      // Simple ML: Find optimal thresholds based on historical performance
      const bestStrategy = optimizeStrategy(trades);
      const confidence = Math.min(winRate + (avgProfitPerTrade / 100), 1);

      botPerformances[botId] = {
        botId,
        winRate,
        totalProfit,
        avgProfitPerTrade,
        bestStrategy,
        confidence
      };

      // Auto-update bot strategy if confidence is high
      if (confidence > 0.6 && trades.length > 10) {
        onStrategyUpdate(botId, bestStrategy);
      }
    });

    setPerformances(Object.values(botPerformances));
  };

  const optimizeStrategy = (trades: TradeRecord[]): { buyThreshold: number; sellThreshold: number } => {
    // Simple genetic algorithm approach
    const strategies = [];
    
    // Test different threshold combinations
    for (let buyThreshold = -5; buyThreshold <= -0.5; buyThreshold += 0.5) {
      for (let sellThreshold = 0.5; sellThreshold <= 5; sellThreshold += 0.5) {
        const profit = simulateStrategy(trades, buyThreshold, sellThreshold);
        strategies.push({ buyThreshold, sellThreshold, profit });
      }
    }

    // Return the most profitable strategy
    const best = strategies.reduce((a, b) => a.profit > b.profit ? a : b);
    return { buyThreshold: best.buyThreshold, sellThreshold: best.sellThreshold };
  };

  const simulateStrategy = (trades: TradeRecord[], buyThreshold: number, sellThreshold: number): number => {
    let totalProfit = 0;
    let position = 0;
    let avgBuyPrice = 0;

    trades.forEach(trade => {
      // Simulate if this trade would have happened with new thresholds
      const marketChange = (trade.profit || 0) / trade.amount * 100; // Approximate market change
      
      if (trade.action === 'buy' && marketChange <= buyThreshold) {
        position += trade.amount;
        avgBuyPrice = ((avgBuyPrice * (position - trade.amount)) + (trade.price * trade.amount)) / position;
      } else if (trade.action === 'sell' && marketChange >= sellThreshold && position > 0) {
        const sellAmount = Math.min(trade.amount, position);
        const profit = (trade.price - avgBuyPrice) * sellAmount;
        totalProfit += profit;
        position -= sellAmount;
      }
    });

    return totalProfit;
  };

  return (
    <Card className="trading-card p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-500" />
        AI Performance Analysis
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
                  <h4 className="font-semibold">Bot {perf.botId}</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="opacity-60">Win Rate:</span>
                    <Badge variant={perf.winRate > 0.6 ? "default" : "secondary"}>
                      {(perf.winRate * 100).toFixed(1)}%
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
              
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                    Buy: {perf.bestStrategy.buyThreshold}% | Sell: {perf.bestStrategy.sellThreshold}%
                  </div>
                </div>
              </div>
              
              {perf.confidence > 0.6 && (
                <div className="mt-3 flex items-center text-xs text-green-400">
                  <Target className="w-3 h-3 mr-1" />
                  Strategy auto-optimized based on performance
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
