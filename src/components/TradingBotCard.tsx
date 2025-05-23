
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Brain, Target } from 'lucide-react';
import { TradingBot } from '@/types/trading';

interface TradingBotCardProps {
  bot: TradingBot;
  onToggle: (botId: string) => void;
}

const TradingBotCard = ({ bot, onToggle }: TradingBotCardProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
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
          onCheckedChange={() => onToggle(bot.id)}
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
  );
};

export default TradingBotCard;
