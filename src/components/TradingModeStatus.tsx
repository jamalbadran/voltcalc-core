
import { AlertCircle } from 'lucide-react';

interface TradingModeStatusProps {
  isPaperMode: boolean;
}

const TradingModeStatus = ({ isPaperMode }: TradingModeStatusProps) => {
  if (isPaperMode) return null;

  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
        <span className="text-sm font-medium text-red-400">
          Live Trading Active - Real Money at Risk
        </span>
      </div>
      <p className="text-xs opacity-80">
        Trades will use real money. Switch to virtual money mode for safe testing.
      </p>
    </div>
  );
};

export default TradingModeStatus;
