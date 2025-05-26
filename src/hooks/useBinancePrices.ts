import { useState, useEffect, useRef } from 'react';
import { CryptoCurrency } from '@/components/trading/types';

interface BinanceTicker {
  s: string; // symbol
  c: string; // close price (current price)
  P: string; // price change percent
  v: string; // volume
}

export const useBinancePrices = () => {
  const [cryptoList, setCryptoList] = useState<CryptoCurrency[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.80, change24h: 2.45, volume: 28500000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2600.50, change24h: -1.25, volume: 15200000000 },
    { symbol: 'BNB', name: 'BNB', price: 315.80, change24h: 1.85, volume: 2100000000 },
    { symbol: 'XRP', name: 'XRP', price: 0.62, change24h: -2.15, volume: 1800000000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.65, change24h: 5.80, volume: 1200000000 },
    { symbol: 'AVAX', name: 'Avalanche', price: 42.15, change24h: 3.45, volume: 890000000 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.25, change24h: -0.85, volume: 850000000 },
    { symbol: 'LINK', name: 'Chainlink', price: 18.75, change24h: 2.30, volume: 750000000 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.95, change24h: 4.20, volume: 680000000 },
    { symbol: 'SOL', name: 'Solana', price: 98.75, change24h: 3.20, volume: 2800000000 }
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Map our symbols to Binance pairs
  const symbolMap = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT', 
    'BNB': 'BNBUSDT',
    'XRP': 'XRPUSDT',
    'ADA': 'ADAUSDT',
    'AVAX': 'AVAXUSDT',
    'DOT': 'DOTUSDT',
    'LINK': 'LINKUSDT',
    'MATIC': 'MATICUSDT',
    'SOL': 'SOLUSDT'
  };

  const connectWebSocket = () => {
    try {
      const symbols = Object.values(symbolMap).map(s => s.toLowerCase());
      const streamNames = symbols.map(symbol => `${symbol}@ticker`);
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames.join('/')}`;
      
      console.log('Connecting to Binance WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to Binance WebSocket');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: BinanceTicker = JSON.parse(event.data);
          
          // Find our symbol from Binance symbol
          const ourSymbol = Object.entries(symbolMap).find(
            ([_, binanceSymbol]) => binanceSymbol === data.s
          )?.[0];

          if (ourSymbol) {
            setCryptoList(prev => prev.map(crypto => {
              if (crypto.symbol === ourSymbol) {
                return {
                  ...crypto,
                  price: parseFloat(data.c),
                  change24h: parseFloat(data.P),
                  volume: parseFloat(data.v) * parseFloat(data.c) // Convert to USD volume
                };
              }
              return crypto;
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Binance WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to Binance WebSocket:', error);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { cryptoList, isConnected };
};
