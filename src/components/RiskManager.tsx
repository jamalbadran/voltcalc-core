
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskSettings {
  maxDailyLoss: number;
  maxPositionSize: number;
  stopLossPercentage: number;
  maxOpenPositions: number;
  riskPerTrade: number;
}

interface RiskManagerProps {
  onRiskViolation: (botId: string, reason: string) => void;
  totalPortfolioValue: number;
}

const RiskManager = ({ onRiskViolation, totalPortfolioValue }: RiskManagerProps) => {
  const { toast } = useToast();
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxDailyLoss: 500,
    maxPositionSize: 1000,
    stopLossPercentage: 5,
    maxOpenPositions: 5,
    riskPerTrade: 2
  });

  const [dailyLoss, setDailyLoss] = useState(0);
  const [openPositions, setOpenPositions] = useState(0);
  const [riskStatus, setRiskStatus] = useState<'safe' | 'warning' | 'danger'>('safe');

  useEffect(() => {
    // Reset daily loss at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const resetTimer = setTimeout(() => {
      setDailyLoss(0);
      toast({
        title: 'Risk Manager',
        description: 'Daily loss counter reset',
      });
    }, timeUntilMidnight);

    return () => clearTimeout(resetTimer);
  }, []);

  useEffect(() => {
    // Update risk status based on current metrics
    const lossPercentage = (dailyLoss / riskSettings.maxDailyLoss) * 100;
    const positionPercentage = (openPositions / riskSettings.maxOpenPositions) * 100;
    
    if (lossPercentage > 80 || positionPercentage > 80) {
      setRiskStatus('danger');
    } else if (lossPercentage > 60 || positionPercentage > 60) {
      setRiskStatus('warning');
    } else {
      setRiskStatus('safe');
    }
  }, [dailyLoss, openPositions, riskSettings]);

  const checkRiskLimits = (botId: string, tradeAmount: number, action: 'buy' | 'sell') => {
    // Check daily loss limit
    if (dailyLoss >= riskSettings.maxDailyLoss) {
      onRiskViolation(botId, 'Daily loss limit exceeded');
      return false;
    }

    // Check position size limit
    if (action === 'buy' && tradeAmount > riskSettings.maxPositionSize) {
      onRiskViolation(botId, 'Position size limit exceeded');
      return false;
    }

    // Check maximum open positions
    if (action === 'buy' && openPositions >= riskSettings.maxOpenPositions) {
      onRiskViolation(botId, 'Maximum open positions limit reached');
      return false;
    }

    // Check risk per trade limit
    const riskAmount = (totalPortfolioValue * riskSettings.riskPerTrade) / 100;
    if (action === 'buy' && tradeAmount > riskAmount) {
      onRiskViolation(botId, 'Risk per trade limit exceeded');
      return false;
    }

    return true;
  };

  const updateRiskMetrics = (loss: number, positionChange: number) => {
    setDailyLoss(prev => Math.max(0, prev + loss));
    setOpenPositions(prev => Math.max(0, prev + positionChange));
  };

  const getRiskColor = () => {
    switch (riskStatus) {
      case 'danger': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getRiskIcon = () => {
    switch (riskStatus) {
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Shield className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="trading-card p-4">
      <h4 className="text-lg font-semibold mb-3 flex items-center">
        <Shield className="w-4 h-4 mr-2 text-blue-500" />
        Risk Management System
        <Badge variant="outline" className={`ml-2 ${getRiskColor()}`}>
          {getRiskIcon()}
          {riskStatus.toUpperCase()}
        </Badge>
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="opacity-60">Daily Loss:</span>
          <div className={`font-medium ${dailyLoss > riskSettings.maxDailyLoss * 0.8 ? 'text-red-400' : 'text-green-400'}`}>
            ${dailyLoss.toFixed(2)} / ${riskSettings.maxDailyLoss}
          </div>
        </div>
        
        <div>
          <span className="opacity-60">Open Positions:</span>
          <div className={`font-medium ${openPositions > riskSettings.maxOpenPositions * 0.8 ? 'text-red-400' : 'text-green-400'}`}>
            {openPositions} / {riskSettings.maxOpenPositions}
          </div>
        </div>
        
        <div>
          <span className="opacity-60">Max Position:</span>
          <div className="font-medium">${riskSettings.maxPositionSize}</div>
        </div>
        
        <div>
          <span className="opacity-60">Risk Per Trade:</span>
          <div className="font-medium">{riskSettings.riskPerTrade}%</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span>Daily Risk Usage</span>
          <span>{((dailyLoss / riskSettings.maxDailyLoss) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              dailyLoss > riskSettings.maxDailyLoss * 0.8 ? 'bg-red-500' : 
              dailyLoss > riskSettings.maxDailyLoss * 0.6 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((dailyLoss / riskSettings.maxDailyLoss) * 100, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default RiskManager;
