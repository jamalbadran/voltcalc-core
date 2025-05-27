
export interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  isActive: boolean;
  profit: number;
  trades: number;
  symbol: string;
  buyThreshold: number;
  sellThreshold: number;
  maxAmount: number;
  learningEnabled: boolean;
}

export interface AutoTradingEngineProps {
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume: number;
  }>;
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void;
}

export interface TechnicalSignal {
  rsi: 'buy' | 'sell' | 'hold';
  macd: 'buy' | 'sell' | 'hold';
  bollinger: 'buy' | 'sell' | 'hold';
  overall: 'buy' | 'sell' | 'hold';
  confidence: number;
}

export interface BacktestResult {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  avgTradeReturn: number;
  bestTrade: number;
  worstTrade: number;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  type: 'conservative' | 'aggressive' | 'balanced' | 'scalping' | 'swing';
  buyThreshold: number;
  sellThreshold: number;
  maxAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  expectedReturn: string;
}

export interface RiskSettings {
  maxDailyLoss: number;
  maxPositionSize: number;
  stopLossPercentage: number;
  maxOpenPositions: number;
  riskPerTrade: number;
}
