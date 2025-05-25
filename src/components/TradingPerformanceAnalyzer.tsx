
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Zap } from 'lucide-react';
import { PerformanceAnalysis } from '@/utils/performanceAnalysis';
import { LearningEngine } from '@/utils/learningEngine';
import PerformanceMetrics from './PerformanceMetrics';

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
        LearningEngine.performDeepLearning(performances, onLearningInsight);
      }
    }, 60000);

    return () => clearInterval(learningInterval);
  }, [performances]);

  const analyzePerformanceWithLearning = () => {
    const basePerformances = PerformanceAnalysis.analyzeBotsPerformance(tradeHistory);
    
    // Add learning insights to each performance
    const performancesWithInsights = basePerformances.map(perf => {
      const botTrades = tradeHistory.filter(t => t.botId === perf.botId);
      const insights = LearningEngine.generateLearningInsights(perf.botId, botTrades);
      
      const enrichedPerformance = {
        ...perf,
        learningInsights: insights
      };

      // Apply learned strategies with higher confidence threshold
      if (perf.confidence > 0.7 && botTrades.length > 15 && perf.adaptationScore > 0.6) {
        onStrategyUpdate(perf.botId, perf.bestStrategy);
        
        // Share the best insight
        if (insights.length > 0) {
          onLearningInsight(perf.botId, insights[0]);
        }
      }

      return enrichedPerformance;
    });

    setPerformances(performancesWithInsights);
  };

  return (
    <div className="relative">
      {/* Elegant background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 rounded-xl blur-xl"></div>
      
      <Card className="trading-card p-8 relative border border-purple-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                AI Self-Learning Performance
              </h3>
              <p className="text-sm text-gray-400">Advanced neural analysis and optimization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Cycle #{learningCycle}
            </Badge>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Learning Active</span>
            </div>
          </div>
        </div>
        
        {performances.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-gray-800/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">Collecting neural data patterns...</p>
            <p className="text-sm text-gray-500">Need at least 4 trades per bot for deep analysis</p>
            <div className="w-32 h-1 bg-gray-700 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse w-1/3"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {performances.map(perf => (
              <PerformanceMetrics key={perf.botId} performance={perf} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TradingPerformanceAnalyzer;
