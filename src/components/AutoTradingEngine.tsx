
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import TradingPerformanceAnalyzer from './TradingPerformanceAnalyzer';
import TotalProfitCard from './TotalProfitCard';
import RiskManager from './RiskManager';
import BacktestingEngine from './BacktestingEngine';
import StrategyTemplates from './StrategyTemplates';
import PaperTradingMode from './PaperTradingMode';
import LearningInsightsCard from './LearningInsightsCard';
import BotManagementSection from './BotManagementSection';
import { useTradingHistory } from '@/hooks/useTradingHistory';
import { useAutonomousTrading } from '@/hooks/useAutonomousTrading';
import { TradingBot, AutoTradingEngineProps } from '@/types/trading';

const AutoTradingEngine = ({ cryptoList, onTrade }: AutoTradingEngineProps) => {
  const { toast } = useToast();
  const { tradeHistory, getTotalProfit } = useTradingHistory();
  const [isPaperMode, setIsPaperMode] = useState(true);
  
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'BTC AI Trader',
      strategy: 'ai_momentum',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'BTC',
      buyThreshold: -2.0,
      sellThreshold: 3.0,
      maxAmount: 1000,
      learningEnabled: true
    },
    {
      id: '2',
      name: 'ETH Smart Bot',
      strategy: 'ai_grid',
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'ETH',
      buyThreshold: -1.5,
      sellThreshold: 2.5,
      maxAmount: 500,
      learningEnabled: true
    }
  ]);

  const { learningInsights, handleLearningInsight } = useAutonomousTrading(
    bots,
    cryptoList,
    onTrade,
    isPaperMode,
    setBots
  );

  const handleStrategyUpdate = (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId && bot.learningEnabled) {
        toast({
          title: 'AI Strategy Self-Optimized',
          description: `${bot.name} learned from performance and adapted its strategy`,
        });
        return {
          ...bot,
          buyThreshold: strategy.buyThreshold,
          sellThreshold: strategy.sellThreshold
        };
      }
      return bot;
    }));
  };

  const toggleBot = (botId: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId) {
        const newActive = !bot.isActive;
        toast({
          title: newActive ? 'AI Bot Activated' : 'AI Bot Deactivated',
          description: `${bot.name} is now ${newActive ? 'learning and trading' : 'stopped'}`,
        });
        return { ...bot, isActive: newActive };
      }
      return bot;
    }));
  };

  const createBot = (newBot: TradingBot) => {
    setBots(prev => [...prev, newBot]);
    toast({
      title: 'New AI Trading Bot Created',
      description: `${newBot.name} is ready to learn and trade`,
    });
  };

  const handleApplyTemplate = (template: any) => {
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: `${template.name} Bot`,
      strategy: `ai_${template.type}`,
      isActive: false,
      profit: 0,
      trades: 0,
      symbol: 'BTC',
      buyThreshold: template.buyThreshold,
      sellThreshold: template.sellThreshold,
      maxAmount: template.maxAmount,
      learningEnabled: true
    };
    
    createBot(newBot);
  };

  const handleRiskViolation = (botId: string, reason: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, isActive: false } : bot
    ));
    
    toast({
      title: 'Risk Limit Violated',
      description: `Bot ${botId} stopped: ${reason}`,
      variant: 'destructive'
    });
  };

  const handleStrategyOptimization = (optimizedStrategy: any) => {
    toast({
      title: 'Strategy Optimization Complete',
      description: `New optimal parameters discovered through backtesting`,
    });
  };

  const getTotalPortfolioValue = () => {
    return cryptoList.reduce((total, crypto) => total + crypto.price, 0);
  };

  return (
    <div className="space-y-6">
      <PaperTradingMode 
        onModeChange={setIsPaperMode}
        cryptoList={cryptoList}
      />

      <RiskManager 
        onRiskViolation={handleRiskViolation}
        totalPortfolioValue={getTotalPortfolioValue()}
      />

      <StrategyTemplates onApplyTemplate={handleApplyTemplate} />

      <BacktestingEngine onStrategyOptimization={handleStrategyOptimization} />

      <TradingPerformanceAnalyzer 
        tradeHistory={tradeHistory}
        onStrategyUpdate={handleStrategyUpdate}
        onLearningInsight={handleLearningInsight}
      />

      <TotalProfitCard totalProfit={getTotalProfit()} />

      <LearningInsightsCard learningInsights={learningInsights} />

      <BotManagementSection
        bots={bots}
        cryptoList={cryptoList}
        onToggleBot={toggleBot}
        onCreateBot={createBot}
      />
    </div>
  );
};

export default AutoTradingEngine;
