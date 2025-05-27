
import { TradingBot } from '@/types/trading';
import { CryptoCurrency } from '@/components/trading/types';
import { TechnicalIndicators } from './technicalIndicators';

export const generatePriceHistory = (crypto: CryptoCurrency) => {
  const history = [];
  let basePrice = crypto.price;
  
  for (let i = 50; i >= 0; i--) {
    const timeAgo = new Date(Date.now() - i * 3600000);
    const volatility = Math.random() * 0.02 - 0.01;
    basePrice = basePrice * (1 + volatility);
    
    history.push({
      price: basePrice,
      timestamp: timeAgo,
      volume: Math.random() * 1000000
    });
  }
  
  return history;
};

export const detectMarketCondition = (change24h: number): 'bullish' | 'bearish' | 'neutral' => {
  if (change24h > 2) return 'bullish';
  if (change24h < -2) return 'bearish';
  return 'neutral';
};

export const findBetterAltcoinOpportunity = (
  bot: TradingBot, 
  currentCrypto: CryptoCurrency | undefined, 
  cryptoList: CryptoCurrency[]
) => {
  if (!currentCrypto) return null;

  const betterOptions = cryptoList.filter(crypto => {
    const volatilityScore = Math.abs(crypto.change24h);
    const currentVolatility = Math.abs(currentCrypto.change24h);
    
    return volatilityScore > currentVolatility + 1.5 && 
           volatilityScore > 3.0 &&
           crypto.volume > currentCrypto.volume * 0.8;
  });

  return betterOptions.length > 0 ? 
    betterOptions.reduce((best, current) => 
      Math.abs(current.change24h) > Math.abs(best.change24h) ? current : best
    ) : null;
};

export const shouldExecuteTrade = (
  bot: TradingBot,
  crypto: CryptoCurrency,
  adaptedThresholds: { buyThreshold: number; sellThreshold: number }
) => {
  const { change24h, volume } = crypto;
  
  const priceHistory = generatePriceHistory(crypto);
  const technicalSignals = TechnicalIndicators.generateTradingSignals(priceHistory);
  
  const isAltcoin = crypto.symbol !== 'BTC' && crypto.symbol !== 'ETH';
  const confidenceThreshold = isAltcoin ? 0.4 : 0.5;
  
  const shouldBuy = change24h <= adaptedThresholds.buyThreshold && 
                   (technicalSignals.overall === 'buy' || technicalSignals.confidence > confidenceThreshold) &&
                   volume > 100000000;

  const shouldSell = change24h >= adaptedThresholds.sellThreshold && 
                    (technicalSignals.overall === 'sell' || technicalSignals.confidence > confidenceThreshold);

  return { 
    shouldBuy, 
    shouldSell, 
    technicalSignals,
    isAltcoin,
    confidenceThreshold
  };
};

export const calculateTradeAmount = (
  bot: TradingBot,
  crypto: CryptoCurrency,
  action: 'buy' | 'sell',
  technicalSignals: any
) => {
  const { change24h } = crypto;
  const isAltcoin = crypto.symbol !== 'BTC' && crypto.symbol !== 'ETH';
  const altcoinMultiplier = isAltcoin ? 1.3 : 1.0;
  const volatilityBonus = Math.min(Math.abs(change24h) / 10, 0.5);
  const autonomyMultiplier = 1.2 + volatilityBonus;

  if (action === 'buy') {
    const riskFactor = Math.min(Math.abs(change24h) / 8, 0.8);
    return bot.maxAmount * (0.05 + riskFactor) * autonomyMultiplier * altcoinMultiplier * technicalSignals.confidence;
  } else {
    const profitFactor = Math.min(change24h / 8, 0.6);
    const amount = bot.maxAmount * (0.05 + profitFactor) * autonomyMultiplier * altcoinMultiplier * technicalSignals.confidence;
    return amount / crypto.price;
  }
};
