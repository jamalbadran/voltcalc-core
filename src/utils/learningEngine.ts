
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
  effectivenessScore?: number;
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
  adaptationScore: number;
  learningInsights: LearningInsight[];
}

export const LearningEngine = {
  generateLearningInsights: (botId: string, trades: TradeRecord[]): LearningInsight[] => {
    const insights: LearningInsight[] = [];
    const recentTrades = trades.slice(-10);
    
    // Pattern recognition for consecutive losses
    const consecutiveLosses = LearningEngine.getConsecutiveLosses(recentTrades);
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
    const profitableHours = LearningEngine.analyzeProfitableTimePatterns(recentTrades);
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
  },

  performDeepLearning: (
    performances: BotPerformance[], 
    onLearningInsight: (botId: string, insight: LearningInsight) => void
  ): void => {
    performances.forEach(perf => {
      if (perf.learningInsights.length > 0) {
        const effectiveInsights = perf.learningInsights.filter(insight => 
          (insight.effectivenessScore || 0) > 0.5
        );

        if (effectiveInsights.length > 2) {
          const metaInsight: LearningInsight = {
            id: `meta-${Date.now()}`,
            botId: perf.botId,
            insight: `Learned to prioritize ${effectiveInsights[0].insight.toLowerCase()} strategies in current market conditions`,
            confidence: 0.8,
            appliedAt: new Date(),
            effectivenessScore: effectiveInsights.reduce((sum, i) => sum + (i.effectivenessScore || 0), 0) / effectiveInsights.length
          };

          onLearningInsight(perf.botId, metaInsight);
        }
      }
    });
  },

  getConsecutiveLosses: (trades: TradeRecord[]): number => {
    let consecutive = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if ((trades[i].profit || 0) <= 0) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  },

  analyzeProfitableTimePatterns: (trades: TradeRecord[]): number[] => {
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
  }
};
