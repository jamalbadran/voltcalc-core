
import { useEffect } from 'react';
import { TradingBot } from '@/types/trading';
import { CryptoCurrency } from '@/components/trading/types';
import { useTradingHistory } from './useTradingHistory';
import { 
  shouldExecuteTrade, 
  calculateTradeAmount, 
  findBetterAltcoinOpportunity 
} from '@/utils/autonomousTrading';

export const useAutonomousEngine = (
  bots: TradingBot[],
  cryptoList: CryptoCurrency[],
  autonomousMode: boolean,
  isPaperMode: boolean,
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void,
  updateBotStats: (botId: string, action: 'buy' | 'sell', amount: number, price: number, profit?: number) => void,
  switchBotToAltcoin: (botId: string, newCrypto: CryptoCurrency) => void,
  applyLearningInsights: (bot: TradingBot, marketData: { change24h: number; price: number }) => { buyThreshold: number; sellThreshold: number }
) => {
  const { addTrade } = useTradingHistory();

  const executeTrade = (
    bot: TradingBot, 
    action: 'buy' | 'sell', 
    amount: number, 
    price: number, 
    crypto: CryptoCurrency, 
    marketCondition: any, 
    volatility: number
  ) => {
    if (isPaperMode) {
      (window as any).executePaperTrade?.(action, bot.symbol, amount);
    } else {
      onTrade(action, bot.symbol, amount);
    }
    
    const profit = action === 'sell' ? amount * price * 0.02 : undefined;
    
    addTrade({
      botId: bot.id,
      action,
      symbol: bot.symbol,
      amount,
      price,
      profit,
      marketCondition,
      volatility
    });
    
    updateBotStats(bot.id, action, amount, price, profit);
  };

  const executeFullyAutonomousTrading = (bot: TradingBot, crypto: CryptoCurrency) => {
    const { change24h, price } = crypto;
    
    const adaptedThresholds = applyLearningInsights(bot, { change24h, price });
    
    const tradeDecision = shouldExecuteTrade(bot, crypto, adaptedThresholds);
    
    if (tradeDecision.shouldBuy) {
      const amount = calculateTradeAmount(bot, crypto, 'buy', tradeDecision.technicalSignals);
      executeTrade(bot, 'buy', amount, price, crypto, 'altcoin_opportunity', Math.abs(change24h));
    } else if (tradeDecision.shouldSell) {
      const sellAmount = calculateTradeAmount(bot, crypto, 'sell', tradeDecision.technicalSignals);
      executeTrade(bot, 'sell', sellAmount, price, crypto, 'altcoin_profit', Math.abs(change24h));
    }
  };

  // Intelligent altcoin switching for maximum profits
  useEffect(() => {
    if (!autonomousMode) return;

    const switchingInterval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive && bot.learningEnabled) {
          const currentCrypto = cryptoList.find(c => c.symbol === bot.symbol);
          const betterOpportunity = findBetterAltcoinOpportunity(bot, currentCrypto, cryptoList);
          
          if (betterOpportunity && betterOpportunity.symbol !== bot.symbol) {
            switchBotToAltcoin(bot.id, betterOpportunity);
          }
        }
      });
    }, 180000);

    return () => clearInterval(switchingInterval);
  }, [autonomousMode, bots, cryptoList]);

  // Main trading execution loop
  useEffect(() => {
    if (!autonomousMode) return;

    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeFullyAutonomousTrading(bot, crypto);
          }
        }
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [bots, cryptoList, autonomousMode]);

  return {
    executeFullyAutonomousTrading,
    executeTrade
  };
};
