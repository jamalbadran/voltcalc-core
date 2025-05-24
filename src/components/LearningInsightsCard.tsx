
import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface LearningInsight {
  id: string;
  botId: string;
  insight: string;
  confidence: number;
  appliedAt: Date;
  effectivenessScore?: number;
}

interface LearningInsightsCardProps {
  learningInsights: LearningInsight[];
}

const LearningInsightsCard = ({ learningInsights }: LearningInsightsCardProps) => {
  if (learningInsights.length === 0) return null;

  return (
    <Card className="trading-card p-4">
      <h4 className="text-lg font-semibold mb-3 flex items-center">
        <Brain className="w-4 h-4 mr-2 text-blue-500" />
        Recent AI Learning Insights
      </h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {learningInsights.slice(-5).reverse().map(insight => (
          <div key={insight.id} className="text-sm bg-blue-900/20 p-2 rounded">
            <div className="flex justify-between items-start">
              <span className="opacity-80">{insight.insight}</span>
              <span className="text-xs text-blue-400 ml-2">
                Bot {insight.botId} • {insight.confidence.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LearningInsightsCard;
