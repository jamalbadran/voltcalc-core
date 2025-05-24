
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BacktestResult {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  avgTradeReturn: number;
  bestTrade: number;
  worstTrade: number;
}

interface BacktestingEngineProps {
  onStrategyOptimization: (optimizedParams: any) => void;
}

const BacktestingEngine = ({ onStrategyOptimization }: BacktestingEngineProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulated historical data
  const generateHistoricalData = (days: number) => {
    const data = [];
    let price = 45000; // Starting BTC price
    
    for (let i = 0; i < days * 24; i++) { // Hourly data
      const volatility = 0.02;
      const trend = Math.random() > 0.5 ? 1 : -1;
      const change = (Math.random() * volatility * trend) + (Math.random() * 0.001 - 0.0005);
      price = price * (1 + change);
      
      data.push({
        timestamp: new Date(Date.now() - (days * 24 - i) * 3600000),
        price: price,
        volume: Math.random() * 1000000 + 500000
      });
    }
    
    return data;
  };

  const runBacktest = async (strategy: any, historicalData: any[]) => {
    setIsRunning(true);
    setProgress(0);
    
    let portfolio = { cash: 10000, crypto: 0 };
    const trades = [];
    let maxPortfolioValue = 10000;
    let minPortfolioValue = 10000;
    
    for (let i = 50; i < historicalData.length; i++) {
      const currentData = historicalData.slice(i - 50, i + 1);
      const currentPrice = currentData[currentData.length - 1].price;
      const change24h = ((currentPrice - currentData[currentData.length - 25].price) / currentData[currentData.length - 25].price) * 100;
      
      // Simulate strategy decision
      const shouldBuy = change24h <= strategy.buyThreshold && portfolio.cash > 100;
      const shouldSell = change24h >= strategy.sellThreshold && portfolio.crypto > 0.001;
      
      if (shouldBuy) {
        const buyAmount = Math.min(portfolio.cash * 0.1, strategy.maxAmount || 1000);
        const cryptoAmount = buyAmount / currentPrice;
        portfolio.cash -= buyAmount;
        portfolio.crypto += cryptoAmount;
        
        trades.push({
          type: 'buy',
          price: currentPrice,
          amount: cryptoAmount,
          timestamp: currentData[currentData.length - 1].timestamp,
          portfolioValue: portfolio.cash + (portfolio.crypto * currentPrice)
        });
      } else if (shouldSell) {
        const sellAmount = portfolio.crypto * 0.1;
        const cashAmount = sellAmount * currentPrice;
        portfolio.cash += cashAmount;
        portfolio.crypto -= sellAmount;
        
        trades.push({
          type: 'sell',
          price: currentPrice,
          amount: sellAmount,
          timestamp: currentData[currentData.length - 1].timestamp,
          portfolioValue: portfolio.cash + (portfolio.crypto * currentPrice)
        });
      }
      
      const currentPortfolioValue = portfolio.cash + (portfolio.crypto * currentPrice);
      maxPortfolioValue = Math.max(maxPortfolioValue, currentPortfolioValue);
      minPortfolioValue = Math.min(minPortfolioValue, currentPortfolioValue);
      
      // Update progress
      setProgress((i / historicalData.length) * 100);
      
      // Small delay to show progress
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    const finalValue = portfolio.cash + (portfolio.crypto * historicalData[historicalData.length - 1].price);
    const totalReturn = ((finalValue - 10000) / 10000) * 100;
    const maxDrawdown = ((maxPortfolioValue - minPortfolioValue) / maxPortfolioValue) * 100;
    
    const profitableTrades = trades.filter(t => t.type === 'sell' && t.portfolioValue > 10000).length;
    const winRate = trades.length > 0 ? (profitableTrades / trades.filter(t => t.type === 'sell').length) * 100 : 0;
    
    const tradeReturns = trades.filter(t => t.type === 'sell').map(t => 
      ((t.portfolioValue - 10000) / 10000) * 100
    );
    
    const avgTradeReturn = tradeReturns.length > 0 ? 
      tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length : 0;
    
    const result: BacktestResult = {
      totalReturn,
      winRate: isNaN(winRate) ? 0 : winRate,
      maxDrawdown,
      sharpeRatio: totalReturn / Math.max(maxDrawdown, 1), // Simplified Sharpe ratio
      totalTrades: trades.length,
      avgTradeReturn,
      bestTrade: tradeReturns.length > 0 ? Math.max(...tradeReturns) : 0,
      worstTrade: tradeReturns.length > 0 ? Math.min(...tradeReturns) : 0
    };
    
    setResults(result);
    setIsRunning(false);
    setProgress(100);
    
    toast({
      title: 'Backtest Completed',
      description: `Total Return: ${totalReturn.toFixed(2)}% | Win Rate: ${winRate.toFixed(1)}%`,
    });
    
    return result;
  };

  const optimizeStrategy = async () => {
    const historicalData = generateHistoricalData(30); // 30 days of data
    const strategies = [];
    
    // Test different parameter combinations
    for (let buyThreshold = -5; buyThreshold <= -0.5; buyThreshold += 0.5) {
      for (let sellThreshold = 0.5; sellThreshold <= 5; sellThreshold += 0.5) {
        const strategy = { buyThreshold, sellThreshold, maxAmount: 1000 };
        const result = await runBacktest(strategy, historicalData);
        strategies.push({ ...strategy, result });
      }
    }
    
    // Find best strategy by Sharpe ratio
    const bestStrategy = strategies.reduce((best, current) => 
      current.result.sharpeRatio > best.result.sharpeRatio ? current : best
    );
    
    onStrategyOptimization(bestStrategy);
    
    toast({
      title: 'Strategy Optimized',
      description: `Best parameters: Buy at ${bestStrategy.buyThreshold}%, Sell at ${bestStrategy.sellThreshold}%`,
    });
  };

  return (
    <Card className="trading-card p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <BarChart className="w-5 h-5 mr-2 text-purple-500" />
        AI Backtesting Engine
      </h3>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={() => runBacktest({ buyThreshold: -2, sellThreshold: 3, maxAmount: 1000 }, generateHistoricalData(30))}
            disabled={isRunning}
            className="flex items-center"
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Running...' : 'Run Backtest'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={optimizeStrategy}
            disabled={isRunning}
          >
            Optimize Strategy
          </Button>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {results && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-lg font-bold ${results.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {results.totalReturn >= 0 ? '+' : ''}{results.totalReturn.toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Total Return</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {results.winRate.toFixed(1)}%
              </div>
              <div className="text-xs opacity-60">Win Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {results.maxDrawdown.toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Max Drawdown</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {results.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-xs opacity-60">Sharpe Ratio</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold">
                {results.totalTrades}
              </div>
              <div className="text-xs opacity-60">Total Trades</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold">
                {results.avgTradeReturn.toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Avg Trade</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                +{results.bestTrade.toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Best Trade</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {results.worstTrade.toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Worst Trade</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BacktestingEngine;
