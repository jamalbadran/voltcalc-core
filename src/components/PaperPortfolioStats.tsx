
import { PaperPortfolio } from '@/types/paperTrading';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface PaperPortfolioStatsProps {
  paperPortfolio: PaperPortfolio;
  isLiveSimulation: boolean;
}

const PaperPortfolioStats = ({ paperPortfolio, isLiveSimulation }: PaperPortfolioStatsProps) => {
  const isProfitable = paperPortfolio.totalPnL >= 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Portfolio Value */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-gray-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <div className={`w-2 h-2 rounded-full ${isLiveSimulation ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
          </div>
          <div className={`text-xl font-bold ${isLiveSimulation ? 'text-green-400' : 'text-gray-400'}`}>
            ${paperPortfolio.totalValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Virtual Portfolio Value</div>
        </div>
      </div>

      {/* Available Cash */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-gray-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <div className={`w-2 h-2 rounded-full ${isLiveSimulation ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          <div className={`text-xl font-bold ${isLiveSimulation ? 'text-white' : 'text-gray-400'}`}>
            ${paperPortfolio.cash.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Available Virtual Cash</div>
        </div>
      </div>

      {/* P&L */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity ${
          isProfitable ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-r from-red-500/20 to-pink-500/20'
        }`}></div>
        <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-gray-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <div className={`w-2 h-2 rounded-full ${isLiveSimulation ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          <div className={`text-xl font-bold ${
            isProfitable ? 
            (isLiveSimulation ? 'text-green-400' : 'text-gray-400') : 
            (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
          }`}>
            {paperPortfolio.totalPnL >= 0 ? '+' : ''}${paperPortfolio.totalPnL.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Virtual P&L</div>
          
          {/* Progress indicator */}
          <div className="mt-2 w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isProfitable ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-pink-400'
              }`}
              style={{ width: `${Math.min(Math.abs(paperPortfolio.totalPnL) / 100, 1) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Return Percentage */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity ${
          isProfitable ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20' : 'bg-gradient-to-r from-red-500/20 to-orange-500/20'
        }`}></div>
        <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-gray-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1 rounded-full ${
              isProfitable ? 'bg-purple-500/20' : 'bg-red-500/20'
            }`}>
              <span className="text-xs font-bold">%</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isLiveSimulation ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          <div className={`text-xl font-bold ${
            isProfitable ? 
            (isLiveSimulation ? 'text-purple-400' : 'text-gray-400') : 
            (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
          }`}>
            {paperPortfolio.totalPnL >= 0 ? '+' : ''}{((paperPortfolio.totalPnL / 10000) * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Virtual Return %</div>
        </div>
      </div>
    </div>
  );
};

export default PaperPortfolioStats;
