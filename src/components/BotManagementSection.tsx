
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { TradingBot } from '@/types/trading';
import TradingBotCard from './TradingBotCard';
import CreateBotForm from './CreateBotForm';

interface BotManagementSectionProps {
  bots: TradingBot[];
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
  onToggleBot: (botId: string) => void;
  onCreateBot: (newBot: TradingBot) => void;
}

const BotManagementSection = ({ 
  bots, 
  cryptoList, 
  onToggleBot, 
  onCreateBot 
}: BotManagementSectionProps) => {
  return (
    <>
      <Card className="trading-card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-500" />
          Advanced AI Trading Bots
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {bots.map(bot => (
            <TradingBotCard
              key={bot.id}
              bot={bot}
              onToggle={onToggleBot}
            />
          ))}
        </div>
      </Card>

      <CreateBotForm
        cryptoList={cryptoList}
        onCreateBot={onCreateBot}
      />
    </>
  );
};

export default BotManagementSection;
