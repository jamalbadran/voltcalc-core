
import { Badge } from '@/components/ui/badge';
import { Brain, Target, BookOpen } from 'lucide-react';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

interface BotPerformance {
  botId: string;
  winRate: number;
  totalProfit: number;
  avgProfitPerTrade: number;
  bestStrategy: {
    buyThreshold: number;
    sellThreshold: number;
  };
  confidence: number;
  learningInsights: LearningInsight[];
  adaptationScore: number;
}

interface PerformanceMetricsProps {
  performance: BotPerformance;
}

const PerformanceMetrics = ({ performance }: PerformanceMetricsProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold flex items-center">
            Bot {performance.botId}
            {performance.adaptationScore > 0.6 && (
              <BookOpen className="w-3 h-3 ml-2 text-blue-400" />
            )}
          </h4>
          <div className="flex items-center space-x-4 text-sm">
            <span className="opacity-60">Win Rate:</span>
            <Badge variant={performance.winRate > 0.6 ? "default" : "secondary"}>
              {(performance.winRate * 100).toFixed(1)}%
            </Badge>
            <span className="opacity-60">Adaptation:</span>
            <Badge variant={performance.adaptationScore > 0.6 ? "default" : "outline"}>
              {(performance.adaptationScore * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-medium text-lg ${performance.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.totalProfit >= 0 ? '+' : ''}${performance.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs opacity-60">
            Avg: ${performance.avgProfitPerTrade.toFixed(2)}/trade
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="opacity-60">AI Confidence:</span>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${performance.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs">{(performance.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <span className="opacity-60">Optimized Strategy:</span>
          <div className="text-xs mt-1">
            Buy: {performance.bestStrategy.buyThreshold.toFixed(1)}% | Sell: {performance.bestStrategy.sellThreshold.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Learning Insights */}
      {performance.learningInsights.length > 0 && (
        <div className="bg-blue-900/20 p-3 rounded mt-3">
          <h5 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
            <Brain className="w-3 h-3 mr-1" />
            Latest Learning Insights
          </h5>
          {performance.learningInsights.slice(0, 2).map(insight => (
            <div key={insight.id} className="text-xs opacity-80 mb-1 flex items-start">
              <Target className="w-2 h-2 mr-1 mt-1 flex-shrink-0" />
              <span>{insight.insight}</span>
              <Badge variant="outline" className="ml-2 text-xs h-4">
                {(insight.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      {performance.confidence > 0.7 && performance.adaptationScore > 0.6 && (
        <div className="mt-3 flex items-center text-xs text-green-400">
          <Target className="w-3 h-3 mr-1" />
          Strategy auto-optimized and actively learning from market patterns
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
