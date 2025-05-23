
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
}

export const useTradingHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);

  const addTrade = useCallback((trade: Omit<TradeRecord, 'id' | 'timestamp'>) => {
    const newTrade: TradeRecord = {
      ...trade,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setTradeHistory(prev => [...prev, newTrade]);
    console.log('Trade recorded:', newTrade);
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

  return {
    tradeHistory,
    addTrade,
    updateTradeProfit,
    getTradesByBot,
    getTotalProfit
  };
};
