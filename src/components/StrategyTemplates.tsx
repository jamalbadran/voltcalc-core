
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  type: 'conservative' | 'aggressive' | 'balanced' | 'scalping' | 'swing';
  buyThreshold: number;
  sellThreshold: number;
  maxAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  expectedReturn: string;
  icon: React.ReactNode;
}

interface StrategyTemplatesProps {
  onApplyTemplate: (template: StrategyTemplate) => void;
}

const StrategyTemplates = ({ onApplyTemplate }: StrategyTemplatesProps) => {
  const { toast } = useToast();
  
  const [templates] = useState<StrategyTemplate[]>([
    {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Low-risk strategy focused on steady, long-term gains with minimal drawdown',
      type: 'conservative',
      buyThreshold: -1.5,
      sellThreshold: 4.0,
      maxAmount: 500,
      riskLevel: 'low',
      timeframe: 'long',
      expectedReturn: '8-15% annually',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'aggressive',
      name: 'High-Growth Momentum',
      description: 'High-risk, high-reward strategy that capitalizes on strong market movements',
      type: 'aggressive',
      buyThreshold: -3.0,
      sellThreshold: 2.0,
      maxAmount: 2000,
      riskLevel: 'high',
      timeframe: 'short',
      expectedReturn: '25-50% annually',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'balanced',
      name: 'Balanced Portfolio',
      description: 'Moderate risk approach balancing growth potential with downside protection',
      type: 'balanced',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000,
      riskLevel: 'medium',
      timeframe: 'medium',
      expectedReturn: '15-25% annually',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'scalping',
      name: 'AI Scalping Bot',
      description: 'Fast-paced strategy making many small profits from minor price movements',
      type: 'scalping',
      buyThreshold: -0.8,
      sellThreshold: 1.2,
      maxAmount: 300,
      riskLevel: 'medium',
      timeframe: 'short',
      expectedReturn: '20-35% annually',
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'swing',
      name: 'Swing Trading Pro',
      description: 'Medium-term strategy capturing price swings over days to weeks',
      type: 'swing',
      buyThreshold: -4.0,
      sellThreshold: 6.0,
      maxAmount: 1500,
      riskLevel: 'medium',
      timeframe: 'medium',
      expectedReturn: '18-30% annually',
      icon: <BookOpen className="w-4 h-4" />
    }
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conservative': return 'text-blue-400 bg-blue-900/20';
      case 'aggressive': return 'text-red-400 bg-red-900/20';
      case 'balanced': return 'text-purple-400 bg-purple-900/20';
      case 'scalping': return 'text-yellow-400 bg-yellow-900/20';
      case 'swing': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleApplyTemplate = (template: StrategyTemplate) => {
    onApplyTemplate(template);
    toast({
      title: 'Strategy Template Applied',
      description: `${template.name} strategy has been configured for your bot`,
    });
  };

  return (
    <Card className="trading-card p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-green-500" />
        AI Strategy Templates
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {template.icon}
                <h4 className="font-semibold ml-2">{template.name}</h4>
              </div>
              <Badge variant="outline" className={getRiskColor(template.riskLevel)}>
                {template.riskLevel} risk
              </Badge>
            </div>
            
            <p className="text-sm opacity-80 mb-3">
              {template.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="opacity-60">Buy Threshold:</span>
                <span className="text-red-400">{template.buyThreshold}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-60">Sell Threshold:</span>
                <span className="text-green-400">+{template.sellThreshold}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-60">Max Position:</span>
                <span>${template.maxAmount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-60">Timeframe:</span>
                <span className="capitalize">{template.timeframe}-term</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={getTypeColor(template.type)}>
                {template.type}
              </Badge>
              <Button 
                size="sm"
                onClick={() => handleApplyTemplate(template)}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs opacity-60">Expected Return</div>
              <div className="text-sm font-medium text-green-400">{template.expectedReturn}</div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
        <h5 className="font-medium text-blue-400 mb-2">Strategy Selection Guide</h5>
        <div className="text-xs space-y-1 opacity-80">
          <div><strong>Conservative:</strong> Best for beginners or risk-averse investors</div>
          <div><strong>Balanced:</strong> Good middle ground for most traders</div>
          <div><strong>Aggressive:</strong> For experienced traders comfortable with high volatility</div>
          <div><strong>Scalping:</strong> Requires constant monitoring, many small trades</div>
          <div><strong>Swing:</strong> Ideal for part-time traders, fewer but larger moves</div>
        </div>
      </div>
    </Card>
  );
};

export default StrategyTemplates;
