
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
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
            <PerformanceMetrics key={perf.botId} performance={perf} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TradingPerformanceAnalyzer;
