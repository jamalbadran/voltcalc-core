
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Brain, Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { TradingBot } from '@/types/trading';

interface TradingBotCardProps {
  bot: TradingBot;
  onToggle: (botId: string) => void;
}

const TradingBotCard = ({ bot, onToggle }: TradingBotCardProps) => {
  const isProfit = bot.profit >= 0;
  
  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-5 border border-gray-700/50 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm transition-all duration-300 group-hover:border-gray-600/50 group-hover:shadow-xl">
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-3 h-3 rounded-full ${
            bot.isActive ? 'bg-green-400 shadow-green-400/50 shadow-lg animate-pulse' : 'bg-gray-500'
          }`}></div>
        </div>
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-lg ${
              bot.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-700'
            } shadow-lg`}>
              <Target className="w-4 h-4 text-white" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-100">{bot.name}</h4>
                {bot.learningEnabled && (
                  <div className="p-1 rounded-full bg-purple-500/20">
                    <Brain className="w-3 h-3 text-purple-400" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-medium text-gray-300">{bot.symbol}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">{bot.strategy}</span>
              </div>
            </div>
          </div>
          
          <Switch
            checked={bot.isActive}
            onCheckedChange={() => onToggle(bot.id)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
          />
        </div>
        
        {/* Metrics with elegant styling */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">P&L</span>
              {isProfit ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
            </div>
            <div className={`text-lg font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}${bot.profit.toFixed(2)}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Trades</span>
              <Zap className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-gray-100">{bot.trades}</div>
          </div>
        </div>
        
        {/* Status and thresholds */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={bot.isActive ? "default" : "secondary"} 
            className={`${
              bot.isActive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg' 
                : 'bg-gray-700 text-gray-300'
            } font-medium`}
          >
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
          
          <div className="text-right">
            <div className="text-xs text-gray-400">Thresholds</div>
            <div className="text-xs font-medium text-gray-300">
              Buy: {bot.buyThreshold}% | Sell: {bot.sellThreshold}%
            </div>
          </div>
        </div>
        
        {/* Performance indicator */}
        <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isProfit ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-pink-400'
            }`}
            style={{ width: `${Math.min(Math.abs(bot.profit) / 50, 1) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TradingBotCard;
