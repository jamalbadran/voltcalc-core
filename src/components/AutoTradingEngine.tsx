
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bot, Play, Pause, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'BTC Momentum Bot',
      strategy: 'momentum',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000
    },
    {
      id: '2',
      name: 'ETH Grid Bot',
      strategy: 'grid',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 500
    }
  ]);

  const [newBot, setNewBot] = useState({
    name: '',
    strategy: 'momentum',
    symbol: 'BTC',
    buyThreshold: -2.0,
    sellThreshold: 3.0,
    maxAmount: 1000
  });

  // Autonomous trading logic
  useEffect(() => {
    const interval = setInterval(() => {
      bots.forEach(bot => {
        if (bot.isActive) {
          const crypto = cryptoList.find(c => c.symbol === bot.symbol);
          if (crypto) {
            executeTrading(bot, crypto);
          }
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [bots, cryptoList]);

  const executeTrading = (bot: TradingBot, crypto: any) => {
    const { change24h } = crypto;
    
    if (bot.strategy === 'momentum') {
      if (change24h <= bot.buyThreshold) {
        // Buy signal
        const amount = Math.min(bot.maxAmount * 0.1, bot.maxAmount);
        onTrade('buy', bot.symbol, amount);
        updateBotStats(bot.id, 'buy', amount);
        
        toast({
          title: `${bot.name} - Buy Signal`,
          description: `Bought $${amount} worth of ${bot.symbol} at ${change24h.toFixed(2)}% change`,
        });
      } else if (change24h >= bot.sellThreshold) {
        // Sell signal
        const amount = bot.maxAmount * 0.1;
        onTrade('sell', bot.symbol, amount / crypto.price);
        updateBotStats(bot.id, 'sell', amount);
        
        toast({
          title: `${bot.name} - Sell Signal`,
          description: `Sold ${(amount / crypto.price).toFixed(6)} ${bot.symbol} at ${change24h.toFixed(2)}% change`,
        });
      }
    }
  };

  const updateBotStats = (botId: string, action: 'buy' | 'sell', amount: number) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const profitChange = action === 'sell' ? amount * 0.02 : -amount * 0.001; // Simulate profit/loss
        return {
          ...bot,
          trades: bot.trades + 1,
          profit: bot.profit + profitChange
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
      strategy: 'momentum',
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000
    });

    toast({
      title: 'Bot Created',
      description: `${bot.name} has been created successfully`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Bots */}
      <Card className="trading-card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-500" />
          Autonomous Trading Bots
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {bots.map(bot => (
            <div key={bot.id} className="p-4 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{bot.name}</h4>
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
          Create New Trading Bot
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-60 block mb-2">Bot Name</label>
            <Input
              placeholder="My Trading Bot"
              value={newBot.name}
              onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <label className="text-sm opacity-60 block mb-2">Strategy</label>
            <Select
              value={newBot.strategy}
              onValueChange={(value) => setNewBot(prev => ({ ...prev, strategy: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="momentum">Momentum Trading</SelectItem>
                <SelectItem value="grid">Grid Trading</SelectItem>
                <SelectItem value="dca">DCA (Dollar Cost Average)</SelectItem>
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
          Create Trading Bot
        </Button>
      </Card>
    </div>
  );
};

export default AutoTradingEngine;
