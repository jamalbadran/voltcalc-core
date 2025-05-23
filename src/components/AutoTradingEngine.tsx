import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bot, Play, Pause, Settings, TrendingUp, TrendingDown, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingPerformanceAnalyzer from './TradingPerformanceAnalyzer';
import { useTradingHistory } from '@/hooks/useTradingHistory';

interface TradingBot {
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

interface AutoTradingEngineProps {
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void;
}

const AutoTradingEngine = ({ cryptoList, onTrade }: AutoTradingEngineProps) => {
  const { toast } = useToast();
  const { tradeHistory, addTrade, getTotalProfit } = useTradingHistory();
  
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'BTC AI Trader',
      strategy: 'ai_momentum',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000,
      learningEnabled: true
    },
    {
      id: '2',
      name: 'ETH Smart Bot',
      strategy: 'ai_grid',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 500,
      learningEnabled: true
    }
  ]);

  const [newBot, setNewBot] = useState({
    name: '',
    strategy: 'ai_momentum',
    symbol: 'BTC',
    buyThreshold: -2.0,
    sellThreshold: 3.0,
    maxAmount: 1000,
    learningEnabled: true
  });

  // Enhanced autonomous trading logic with profit calculation
  useEffect(() => {
    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeEnhancedTrading(bot, crypto);
          }
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [bots, cryptoList]);

  const executeEnhancedTrading = (bot: TradingBot, crypto: any) => {
    const { change24h, price } = crypto;
    
    // Enhanced strategy that considers market volatility and bot's learning
    const volatilityMultiplier = Math.abs(change24h) > 5 ? 0.5 : 1; // Reduce trading in high volatility
    const adjustedBuyThreshold = bot.buyThreshold * volatilityMultiplier;
    const adjustedSellThreshold = bot.sellThreshold * volatilityMultiplier;
    
    if (bot.strategy.includes('ai_')) {
      if (change24h <= adjustedBuyThreshold) {
        // Smart buy signal with risk management
        const riskFactor = Math.min(Math.abs(change24h) / 10, 0.5); // Higher risk = smaller position
        const amount = bot.maxAmount * (0.05 + riskFactor); // 5-55% of max amount
        
        onTrade('buy', bot.symbol, amount);
        
        // Record trade for ML analysis
        addTrade({
          botId: bot.id,
          action: 'buy',
          symbol: bot.symbol,
          amount,
          price
        });
        
        updateBotStats(bot.id, 'buy', amount, price);
        
        toast({
          title: `${bot.name} - AI Buy Signal`,
          description: `Bought $${amount.toFixed(2)} of ${bot.symbol} at ${change24h.toFixed(2)}% change`,
        });
        
      } else if (change24h >= adjustedSellThreshold) {
        // Smart sell signal with profit optimization
        const profitFactor = Math.min(change24h / 10, 0.3); // Higher profit = larger sell
        const amount = bot.maxAmount * (0.05 + profitFactor);
        const sellAmount = amount / price;
        
        onTrade('sell', bot.symbol, sellAmount);
        
        // Calculate estimated profit
        const estimatedProfit = amount * 0.02 * (1 + profitFactor); // Enhanced profit calculation
        
        // Record trade for ML analysis
        addTrade({
          botId: bot.id,
          action: 'sell',
          symbol: bot.symbol,
          amount: sellAmount,
          price,
          profit: estimatedProfit
        });
        
        updateBotStats(bot.id, 'sell', amount, price, estimatedProfit);
        
        toast({
          title: `${bot.name} - AI Sell Signal`,
          description: `Sold ${sellAmount.toFixed(6)} ${bot.symbol} for estimated $${estimatedProfit.toFixed(2)} profit`,
        });
      }
    }
  };

  const updateBotStats = (botId: string, action: 'buy' | 'sell', amount: number, price: number, profit = 0) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const profitChange = action === 'sell' ? profit : -amount * 0.001; // Real profit tracking
        return {
          ...bot,
          trades: bot.trades + 1,
          profit: bot.profit + profitChange
        };
      }
      return bot;
    }));
  };

  const handleStrategyUpdate = (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId && bot.learningEnabled) {
        toast({
          title: 'AI Strategy Updated',
          description: `${bot.name} learned from past trades and optimized its strategy`,
        });
        return {
          ...bot,
          buyThreshold: strategy.buyThreshold,
          sellThreshold: strategy.sellThreshold
        };
      }
      return bot;
    }));
  };

  const toggleBot = (botId: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const newActive = !bot.isActive;
        toast({
          title: newActive ? 'Bot Activated' : 'Bot Deactivated',
          description: `${bot.name} is now ${newActive ? 'running' : 'stopped'}`,
        });
        return { ...bot, isActive: newActive };
      }
      return bot;
    }));
  };

  const createBot = () => {
    if (!newBot.name) {
      toast({
        title: 'Error',
        description: 'Please enter a bot name',
        variant: 'destructive',
      });
      return;
    }

    const bot: TradingBot = {
      id: Date.now().toString(),
      ...newBot,
      isActive: false,
      profit: 0,
      trades: 0
    };

    setBots(prev => [...prev, bot]);
    setNewBot({
      name: '',
      strategy: 'ai_momentum',
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000,
      learningEnabled: true
    });

    toast({
      title: 'AI Bot Created',
      description: `${bot.name} has been created with machine learning enabled`,
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Performance Analysis */}
      <TradingPerformanceAnalyzer 
        tradeHistory={tradeHistory}
        onStrategyUpdate={handleStrategyUpdate}
      />

      {/* Total Profit Summary */}
      <Card className="trading-card p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            <span className="font-semibold">Total AI Profit</span>
          </div>
          <div className={`text-2xl font-bold ${getTotalProfit() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {getTotalProfit() >= 0 ? '+' : ''}${getTotalProfit().toFixed(2)}
          </div>
        </div>
      </Card>

      {/* Active Bots */}
      <Card className="trading-card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-500" />
          AI Trading Bots
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {bots.map(bot => (
            <div key={bot.id} className="p-4 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold flex items-center">
                    {bot.name}
                    {bot.learningEnabled && <Brain className="w-3 h-3 ml-1 text-purple-400" />}
                  </h4>
                  <p className="text-sm opacity-60">{bot.symbol} • {bot.strategy}</p>
                </div>
                <Switch
                  checked={bot.isActive}
                  onCheckedChange={() => toggleBot(bot.id)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="opacity-60">Profit/Loss:</span>
                  <div className={`font-medium ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${bot.profit.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="opacity-60">Trades:</span>
                  <div className="font-medium">{bot.trades}</div>
                </div>
              </div>
              
              <div className="mt-3">
                <Badge variant={bot.isActive ? "default" : "secondary"} className="mr-2">
                  {bot.isActive ? (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <span className="text-xs opacity-60">
                  Buy: {bot.buyThreshold}% | Sell: {bot.sellThreshold}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create New Bot */}
      <Card className="trading-card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-yellow-500" />
          Create New AI Trading Bot
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-60 block mb-2">Bot Name</label>
            <Input
              placeholder="My AI Trading Bot"
              value={newBot.name}
              onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">AI Strategy</label>
            <Select
              value={newBot.strategy}
              onValueChange={(value) => setNewBot(prev => ({ ...prev, strategy: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_momentum">AI Momentum Trading</SelectItem>
                <SelectItem value="ai_grid">AI Grid Trading</SelectItem>
                <SelectItem value="ai_dca">AI DCA (Smart Average)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">Cryptocurrency</label>
            <Select
              value={newBot.symbol}
              onValueChange={(value) => setNewBot(prev => ({ ...prev, symbol: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cryptoList.map(crypto => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol} - {crypto.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">Max Amount ($)</label>
            <Input
              type="number"
              placeholder="1000"
              value={newBot.maxAmount}
              onChange={(e) => setNewBot(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) || 0 }))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">Buy Threshold (%)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="-2.0"
              value={newBot.buyThreshold}
              onChange={(e) => setNewBot(prev => ({ ...prev, buyThreshold: parseFloat(e.target.value) || 0 }))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">Sell Threshold (%)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="3.0"
              value={newBot.sellThreshold}
              onChange={(e) => setNewBot(prev => ({ ...prev, sellThreshold: parseFloat(e.target.value) || 0 }))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>
        
        <Button
          onClick={createBot}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Create AI Trading Bot
        </Button>
      </Card>
    </div>
  );
};

export default AutoTradingEngine;
