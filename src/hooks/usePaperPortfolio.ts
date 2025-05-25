
import { useState, useEffect } from 'react';
import { PaperPortfolio } from '@/types/paperTrading';
import { useToast } from '@/hooks/use-toast';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export const usePaperPortfolio = (cryptoList: CryptoCurrency[], isLiveSimulation: boolean) => {
  const { toast } = useToast();
  const [paperPortfolio, setPaperPortfolio] = useState<PaperPortfolio>({
    cash: 10000,
    positions: {},
    totalValue: 10000,
    totalPnL: 0
  });

  // Update portfolio values based on current prices
  useEffect(() => {
    const updatedPositions = { ...paperPortfolio.positions };
    let totalPositionValue = 0;

    Object.entries(updatedPositions).forEach(([symbol, position]) => {
      const crypto = cryptoList.find(c => c.symbol === symbol);
      if (crypto) {
        position.value = position.amount * crypto.price;
        totalPositionValue += position.value;
      }
    });

    const newTotalValue = paperPortfolio.cash + totalPositionValue;
    const newPnL = newTotalValue - 10000; // Starting capital

    setPaperPortfolio(prev => ({
      ...prev,
      positions: updatedPositions,
      totalValue: newTotalValue,
      totalPnL: newPnL
    }));
  }, [cryptoList]);

  const resetPaperPortfolio = () => {
    setPaperPortfolio({
      cash: 10000,
      positions: {},
      totalValue: 10000,
      totalPnL: 0
    });
    
    toast({
      title: 'Paper Portfolio Reset',
      description: 'Virtual portfolio has been reset to $10,000',
    });
  };

  const executePaperTrade = (action: 'buy' | 'sell', symbol: string, amount: number) => {
    if (!isLiveSimulation) return;
    
    const crypto = cryptoList.find(c => c.symbol === symbol);
    if (!crypto) return;

    setPaperPortfolio(prev => {
      const newPortfolio = { ...prev };
      
      if (action === 'buy') {
        const cost = amount;
        if (cost > newPortfolio.cash) {
          if (isLiveSimulation) {
            toast({
              title: 'Virtual Trade Rejected',
              description: `Insufficient funds: Need $${cost.toFixed(2)}, have $${newPortfolio.cash.toFixed(2)}`,
              variant: 'destructive'
            });
          }
          return prev;
        }
        
        const cryptoAmount = cost / crypto.price;
        newPortfolio.cash -= cost;
        
        if (!newPortfolio.positions[symbol]) {
          newPortfolio.positions[symbol] = {
            amount: 0,
            avgPrice: 0,
            value: 0
          };
        }
        
        const position = newPortfolio.positions[symbol];
        const totalAmount = position.amount + cryptoAmount;
        const totalCost = (position.amount * position.avgPrice) + cost;
        
        position.amount = totalAmount;
        position.avgPrice = totalCost / totalAmount;
        position.value = totalAmount * crypto.price;

        if (isLiveSimulation) {
          toast({
            title: 'Virtual Buy Executed',
            description: `Bought ${cryptoAmount.toFixed(6)} ${symbol} for $${cost.toFixed(2)}`,
          });
        }
        
      } else { // sell
        const position = newPortfolio.positions[symbol];
        if (!position || position.amount < amount) {
          if (isLiveSimulation) {
            toast({
              title: 'Virtual Trade Rejected',
              description: `Insufficient ${symbol} to sell`,
              variant: 'destructive'
            });
          }
          return prev;
        }
        
        const sellValue = amount * crypto.price;
        newPortfolio.cash += sellValue;
        position.amount -= amount;
        position.value = position.amount * crypto.price;
        
        if (position.amount < 0.000001) {
          delete newPortfolio.positions[symbol];
        }

        if (isLiveSimulation) {
          toast({
            title: 'Virtual Sell Executed',
            description: `Sold ${amount.toFixed(6)} ${symbol} for $${sellValue.toFixed(2)}`,
          });
        }
      }
      
      return newPortfolio;
    });
  };

  return {
    paperPortfolio,
    resetPaperPortfolio,
    executePaperTrade
  };
};
