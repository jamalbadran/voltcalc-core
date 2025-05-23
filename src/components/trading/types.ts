
export interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

export interface PortfolioItem {
  symbol: string;
  amount: number;
  value: number;
}
