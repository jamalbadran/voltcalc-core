
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Brain, Zap, Target, Activity } from 'lucide-react';

interface AutonomousTradingControlProps {
  autonomousMode: boolean;
  onToggleAutonomous: () => void;
  activeBots: number;
  totalProfit: number;
  learningInsights: number;
}

const AutonomousTradingControl = ({ 
  autonomousMode, 
  onToggleAutonomous, 
  activeBots, 
  totalProfit,
  learningInsights 
}: AutonomousTradingControlProps) => {
  return (
    <Card className="trading-card p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            Fully Autonomous AI Trading System
          </h3>
          <p className="text-sm opacity-70 mt-1">
            Self-learning, self-optimizing, zero human intervention required
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={autonomousMode ? "default" : "secondary"} className="flex items-center">
            {autonomousMode ? (
              <>
                <Zap className="w-3 h-3 mr-1" />
                AUTONOMOUS
              </>
            ) : (
              <>
                <Activity className="w-3 h-3 mr-1" />
                MANUAL
              </>
            )}
          </Badge>
          <Switch
            checked={autonomousMode}
            onCheckedChange={onToggleAutonomous}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
      </div>

      {autonomousMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Active AI Bots</span>
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xl font-semibold text-green-400">{activeBots}</div>
            <div className="text-xs opacity-60">Trading autonomously</div>
          </div>

          <div className="bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Total AI Profit</span>
              <Brain className="w-4 h-4 text-blue-400" />
            </div>
            <div className={`text-xl font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalProfit.toFixed(2)}
            </div>
            <div className="text-xs opacity-60">Fully automated</div>
          </div>

          <div className="bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Learning Insights</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-semibold text-purple-400">{learningInsights}</div>
            <div className="text-xs opacity-60">Self-improving</div>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Auto-creates trading bots for market opportunities
        </div>
        <div className="flex items-center text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          Continuously optimizes strategies every 10 minutes
        </div>
        <div className="flex items-center text-purple-400">
          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
          Self-learning from market patterns and performance
        </div>
        <div className="flex items-center text-yellow-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
          Removes underperforming bots automatically
        </div>
      </div>
    </Card>
  );
};

export default AutonomousTradingControl;
