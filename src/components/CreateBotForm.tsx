
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TradingBot } from '@/types/trading';

interface CreateBotFormProps {
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
  onCreateBot: (bot: TradingBot) => void;
}

const CreateBotForm = ({ cryptoList, onCreateBot }: CreateBotFormProps) => {
  const { toast } = useToast();
  
  const [newBot, setNewBot] = useState({
    name: '',
    strategy: 'ai_momentum',
    symbol: 'BTC',
    buyThreshold: -2.0,
    sellThreshold: 3.0,
    maxAmount: 1000,
    learningEnabled: true
  });

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

    onCreateBot(bot);
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
  );
};

export default CreateBotForm;
