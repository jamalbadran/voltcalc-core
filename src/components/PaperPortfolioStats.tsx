
import { PaperPortfolio } from '@/types/paperTrading';

interface PaperPortfolioStatsProps {
  paperPortfolio: PaperPortfolio;
  isLiveSimulation: boolean;
}

const PaperPortfolioStats = ({ paperPortfolio, isLiveSimulation }: PaperPortfolioStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className={`text-lg font-bold ${isLiveSimulation ? 'text-green-400' : 'text-gray-400'}`}>
          ${paperPortfolio.totalValue.toFixed(2)}
        </div>
        <div className="text-xs opacity-60">Virtual Portfolio Value</div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-bold ${isLiveSimulation ? 'text-white' : 'text-gray-400'}`}>
          ${paperPortfolio.cash.toFixed(2)}
        </div>
        <div className="text-xs opacity-60">Available Virtual Cash</div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-bold ${
          paperPortfolio.totalPnL >= 0 ? 
          (isLiveSimulation ? 'text-green-400' : 'text-gray-400') : 
          (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
        }`}>
          {paperPortfolio.totalPnL >= 0 ? '+' : ''}${paperPortfolio.totalPnL.toFixed(2)}
        </div>
        <div className="text-xs opacity-60">Virtual P&L</div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-bold ${
          paperPortfolio.totalPnL >= 0 ? 
          (isLiveSimulation ? 'text-green-400' : 'text-gray-400') : 
          (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
        }`}>
          {paperPortfolio.totalPnL >= 0 ? '+' : ''}{((paperPortfolio.totalPnL / 10000) * 100).toFixed(2)}%
        </div>
        <div className="text-xs opacity-60">Virtual Return %</div>
      </div>
    </div>
  );
};

export default PaperPortfolioStats;
