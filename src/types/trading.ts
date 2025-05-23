
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
  }>;
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void;
}
