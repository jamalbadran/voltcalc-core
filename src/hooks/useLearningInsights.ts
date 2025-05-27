
import { useState, useCallback, useEffect } from 'react';
import { PerformanceAnalysis } from '@/utils/performanceAnalysis';
import { LearningEngine } from '@/utils/learningEngine';
import { TradingBot } from '@/types/trading';
import { useTradingHistory } from './useTradingHistory';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

export const useLearningInsights = (
  bots: TradingBot[],
  setBots: React.Dispatch<React.SetStateAction<TradingBot[]>>,
  autonomousMode: boolean
) => {
  const { tradeHistory } = useTradingHistory();
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [lastOptimization, setLastOptimization] = useState(Date.now());

  const handleLearningInsight = useCallback((botId: string, insight: LearningInsight) => {
    setLearningInsights(prev => {
      const updated = [...prev, insight];
      return updated.slice(-100);
    });
  }, []);

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

    setBots(prev => prev.filter(bot => {
      const performance = performances.find(p => p.botId === bot.id);
      if (performance && performance.totalProfit < -100 && performance.winRate < 0.3) {
        console.log(`Autonomous Bot Retirement: ${bot.name} was automatically retired`);
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

  // Enhanced learning cycle for altcoins
  useEffect(() => {
    if (!autonomousMode) return;

    const learningInterval = setInterval(() => {
      performDeepLearning();
    }, 150000);

    return () => clearInterval(learningInterval);
  }, [autonomousMode, tradeHistory]);

  // Continuous optimization for altcoin trading
  useEffect(() => {
    if (!autonomousMode) return;

    const optimizationInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastOptimization > 480000) {
        performAutonomousOptimization();
        setLastOptimization(now);
      }
    }, 60000);

    return () => clearInterval(optimizationInterval);
  }, [autonomousMode, lastOptimization, tradeHistory]);

  return {
    learningInsights,
    handleLearningInsight,
    applyLearningInsights
  };
};
