
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

interface TotalProfitCardProps {
  totalProfit: number;
}

const TotalProfitCard = ({ totalProfit }: TotalProfitCardProps) => {
  const isProfit = totalProfit >= 0;
  
  return (
    <div className="relative">
      {/* Elegant glow effect */}
      <div className={`absolute inset-0 rounded-xl blur-xl opacity-30 ${
        isProfit ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      <Card className="trading-card p-6 relative border-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full animate-[shimmer_3s_infinite]"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full shadow-lg ${
                isProfit ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-100">Total AI Profit</h3>
                <p className="text-xs text-gray-400">Cumulative algorithmic returns</p>
              </div>
            </div>
            
            <div className={`p-2 rounded-full ${
              isProfit ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isProfit ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <div className={`text-3xl font-bold ${
              isProfit ? 'text-green-400' : 'text-red-400'
            }`}>
              {isProfit ? '+' : ''}${Math.abs(totalProfit).toFixed(2)}
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${
              isProfit ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {isProfit ? '↗' : '↘'} {isProfit ? 'PROFIT' : 'LOSS'}
            </div>
          </div>
          
          {/* Progress bar for visual appeal */}
          <div className="mt-4">
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isProfit ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-pink-400'
                }`}
                style={{ width: `${Math.min(Math.abs(totalProfit) / 100, 1) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Add shimmer animation to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
`;
document.head.appendChild(style);

export default TotalProfitCard;
