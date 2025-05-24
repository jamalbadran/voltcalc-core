
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
}

export const PerformanceAnalysis = {
  analyzeBotsPerformance: (tradeHistory: TradeRecord[]): BotPerformance[] => {
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

      const bestStrategy = PerformanceAnalysis.optimizeStrategyWithContext(trades);
      const confidence = PerformanceAnalysis.calculateDynamicConfidence(trades, winRate, avgProfitPerTrade);
      const adaptationScore = PerformanceAnalysis.calculateAdaptationScore(trades);

      botPerformances[botId] = {
        botId,
        winRate,
        totalProfit,
        avgProfitPerTrade,
        bestStrategy,
        confidence,
        adaptationScore
      };
    });

    return Object.values(botPerformances);
  },

  optimizeStrategyWithContext: (trades: TradeRecord[]): { buyThreshold: number; sellThreshold: number } => {
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
        const profit = PerformanceAnalysis.simulateContextualStrategy(trades, buyThreshold, sellThreshold, marketBias);
        strategies.push({ buyThreshold, sellThreshold, profit });
      }
    }

    const best = strategies.reduce((a, b) => a.profit > b.profit ? a : b);
    return { buyThreshold: best.buyThreshold, sellThreshold: best.sellThreshold };
  },

  simulateContextualStrategy: (trades: TradeRecord[], buyThreshold: number, sellThreshold: number, marketBias: string): number => {
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
  },

  calculateDynamicConfidence: (trades: TradeRecord[], winRate: number, avgProfit: number): number => {
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
  },

  calculateAdaptationScore: (trades: TradeRecord[]): number => {
    if (trades.length < 10) return 0;
    
    const earlyTrades = trades.slice(0, Math.floor(trades.length / 2));
    const lateTrades = trades.slice(Math.floor(trades.length / 2));
    
    const earlyWinRate = earlyTrades.filter(t => (t.profit || 0) > 0).length / earlyTrades.length;
    const lateWinRate = lateTrades.filter(t => (t.profit || 0) > 0).length / lateTrades.length;
    
    return Math.max(0, lateWinRate - earlyWinRate + 0.5);
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
