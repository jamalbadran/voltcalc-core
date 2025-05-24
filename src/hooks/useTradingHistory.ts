import { useState, useCallback } from 'react';

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

export const useTradingHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);

  const addTrade = useCallback((trade: Omit<TradeRecord, 'id' | 'timestamp'>) => {
    const newTrade: TradeRecord = {
      ...trade,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setTradeHistory(prev => {
      const updated = [...prev, newTrade];
      // Keep only the last 1000 trades to prevent memory issues
      return updated.slice(-1000);
    });
    
    console.log('Enhanced trade recorded:', {
      ...newTrade,
      marketCondition: newTrade.marketCondition || 'neutral',
      volatility: newTrade.volatility || 0
    });
  }, []);

  const updateTradeProfit = useCallback((tradeId: string, profit: number) => {
    setTradeHistory(prev => prev.map(trade => 
      trade.id === tradeId ? { ...trade, profit } : trade
    ));
  }, []);

  const getTradesByBot = useCallback((botId: string) => {
    return tradeHistory.filter(trade => trade.botId === botId);
  }, [tradeHistory]);

  const getTotalProfit = useCallback(() => {
    return tradeHistory.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  }, [tradeHistory]);

  const getMarketConditionStats = useCallback(() => {
    const conditions = tradeHistory.reduce((acc, trade) => {
      const condition = trade.marketCondition || 'neutral';
      if (!acc[condition]) acc[condition] = { count: 0, totalProfit: 0 };
      acc[condition].count++;
      acc[condition].totalProfit += trade.profit || 0;
      return acc;
    }, {} as Record<string, { count: number; totalProfit: number }>);

    return conditions;
  }, [tradeHistory]);

  const getVolatilityAnalysis = useCallback(() => {
    const volatilityTrades = tradeHistory.filter(trade => trade.volatility !== undefined);
    if (volatilityTrades.length === 0) return { avgVolatility: 0, highVolatilityProfit: 0 };

    const avgVolatility = volatilityTrades.reduce((sum, trade) => sum + (trade.volatility || 0), 0) / volatilityTrades.length;
    const highVolatilityTrades = volatilityTrades.filter(trade => (trade.volatility || 0) > avgVolatility);
    const highVolatilityProfit = highVolatilityTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

    return { avgVolatility, highVolatilityProfit };
  }, [tradeHistory]);

  return {
    tradeHistory,
    addTrade,
    updateTradeProfit,
    getTradesByBot,
    getTotalProfit,
    getMarketConditionStats,
    getVolatilityAnalysis
  };
};
