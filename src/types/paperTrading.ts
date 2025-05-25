
export interface PaperPortfolio {
  cash: number;
  positions: {
    [symbol: string]: {
      amount: number;
      avgPrice: number;
      value: number;
    };
  };
  totalValue: number;
  totalPnL: number;
}

export interface PaperTradingModeProps {
  onModeChange: (isPaperMode: boolean) => void;
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
}
