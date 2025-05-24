
interface PriceData {
  price: number;
  timestamp: Date;
  volume?: number;
}

export class TechnicalIndicators {
  static calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static calculateEMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  static calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    
    // For simplicity, returning just the MACD line
    // In a full implementation, you'd calculate the signal line and histogram
    return {
      macd: macdLine,
      signal: 0, // Simplified
      histogram: macdLine
    };
  }

  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  static calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14) {
    if (highs.length < period) return null;
    
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    return {
      k: k,
      d: k // Simplified - should be 3-period SMA of %K
    };
  }

  static generateTradingSignals(priceData: PriceData[]): {
    rsi: 'buy' | 'sell' | 'hold';
    macd: 'buy' | 'sell' | 'hold';
    bollinger: 'buy' | 'sell' | 'hold';
    overall: 'buy' | 'sell' | 'hold';
    confidence: number;
  } {
    const prices = priceData.map(d => d.price);
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bollinger = this.calculateBollingerBands(prices);
    
    let signals = { buy: 0, sell: 0, hold: 0 };
    
    // RSI signals
    if (rsi !== null) {
      if (rsi < 30) signals.buy++;
      else if (rsi > 70) signals.sell++;
      else signals.hold++;
    }
    
    // MACD signals
    if (macd !== null) {
      if (macd.macd > 0) signals.buy++;
      else if (macd.macd < 0) signals.sell++;
      else signals.hold++;
    }
    
    // Bollinger Bands signals
    if (bollinger !== null) {
      const currentPrice = prices[prices.length - 1];
      if (currentPrice < bollinger.lower) signals.buy++;
      else if (currentPrice > bollinger.upper) signals.sell++;
      else signals.hold++;
    }
    
    const totalSignals = signals.buy + signals.sell + signals.hold;
    const strongestSignal = Math.max(signals.buy, signals.sell, signals.hold);
    const confidence = strongestSignal / totalSignals;
    
    let overall: 'buy' | 'sell' | 'hold' = 'hold';
    if (signals.buy === strongestSignal) overall = 'buy';
    else if (signals.sell === strongestSignal) overall = 'sell';
    
    return {
      rsi: rsi !== null ? (rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : 'hold') : 'hold',
      macd: macd !== null ? (macd.macd > 0 ? 'buy' : 'sell') : 'hold',
      bollinger: bollinger !== null ? 
        (prices[prices.length - 1] < bollinger.lower ? 'buy' : 
         prices[prices.length - 1] > bollinger.upper ? 'sell' : 'hold') : 'hold',
      overall,
      confidence
    };
  }
}
