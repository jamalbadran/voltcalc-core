
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
import AutonomousTradingControl from './AutonomousTradingControl';
import { useTradingHistory } from '@/hooks/useTradingHistory';
import { useBotManagement } from '@/hooks/useBotManagement';
import { useAutonomousEngine } from '@/hooks/useAutonomousEngine';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { AutoTradingEngineProps } from '@/types/trading';

const AutoTradingEngine = ({ cryptoList, onTrade }: AutoTradingEngineProps) => {
  const { toast } = useToast();
  const { tradeHistory, getTotalProfit } = useTradingHistory();
  const [isPaperMode, setIsPaperMode] = useState(true);
  const [autonomousMode, setAutonomousMode] = useState(false);

  const {
    bots,
    setBots,
    switchBotToAltcoin,
    updateBotStats
  } = useBotManagement(cryptoList, autonomousMode, isPaperMode);

  const {
    learningInsights,
    handleLearningInsight,
    applyLearningInsights
  } = useLearningInsights(bots, setBots, autonomousMode);

  useAutonomousEngine(
    bots,
    cryptoList,
    autonomousMode,
    isPaperMode,
    onTrade,
    updateBotStats,
    switchBotToAltcoin,
    applyLearningInsights
  );

  const toggleAutonomousMode = () => {
    setAutonomousMode(prev => {
      const newMode = !prev;
      
      if (newMode) {
        setBots(prev => prev.map(bot => ({ ...bot, isActive: true })));
        toast({
          title: 'Autonomous Mode Activated',
          description: 'AI is now fully managing all trading decisions',
        });
      } else {
        toast({
          title: 'Autonomous Mode Deactivated',
          description: 'Manual control restored',
        });
      }
      
      return newMode;
    });
  };

  const handlePaperModeChange = (paperMode: boolean) => {
    setIsPaperMode(paperMode);
    
    if (paperMode) {
      toast({
        title: 'Live Simulation Ready',
        description: 'AI can now safely trade with virtual money in real-time',
      });
    } else {
      toast({
        title: 'Real Trading Mode',
        description: 'Warning: AI will use real money for trades',
        variant: 'destructive'
      });
    }
  };

  const handleStrategyUpdate = (botId: string, strategy: { buyThreshold: number; sellThreshold: number }) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === botId && bot.learningEnabled) {
        if (autonomousMode) {
          // In autonomous mode, just apply the update silently
          return {
            ...bot,
            buyThreshold: strategy.buyThreshold,
            sellThreshold: strategy.sellThreshold
          };
        } else {
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
      }
      return bot;
    }));
  };

  const toggleBot = (botId: string) => {
    if (autonomousMode) {
      toast({
        title: 'Autonomous Mode Active',
        description: 'Bots are managed automatically in autonomous mode',
        variant: 'destructive'
      });
      return;
    }

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

  const createBot = (newBot: any) => {
    setBots(prev => [...prev, { ...newBot, isActive: autonomousMode }]);
    toast({
      title: 'New AI Trading Bot Created',
      description: `${newBot.name} is ${autonomousMode ? 'automatically active' : 'ready to learn and trade'}`,
    });
  };

  const handleApplyTemplate = (template: any) => {
    const newBot = {
      id: Date.now().toString(),
      name: `${template.name} Bot`,
      strategy: `ai_${template.type}`,
      isActive: autonomousMode,
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
    if (!autonomousMode) {
      setBots(prev => prev.map(bot => 
        bot.id === botId ? { ...bot, isActive: false } : bot
      ));
      
      toast({
        title: 'Risk Limit Violated',
        description: `Bot ${botId} stopped: ${reason}`,
        variant: 'destructive'
      });
    }
    // In autonomous mode, risk is managed automatically
  };

  const handleStrategyOptimization = (optimizedStrategy: any) => {
    toast({
      title: 'Strategy Optimization Complete',
      description: `New optimal parameters discovered through ${autonomousMode ? 'autonomous' : 'manual'} backtesting`,
    });
  };

  const getTotalPortfolioValue = () => {
    return cryptoList.reduce((total, crypto) => total + crypto.price, 0);
  };

  const activeBots = bots.filter(bot => bot.isActive).length;
  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0);

  return (
    <div className="space-y-6">
      <AutonomousTradingControl
        autonomousMode={autonomousMode}
        onToggleAutonomous={toggleAutonomousMode}
        activeBots={activeBots}
        totalProfit={totalProfit}
        learningInsights={learningInsights.length}
      />

      <PaperTradingMode 
        onModeChange={handlePaperModeChange}
        cryptoList={cryptoList}
      />

      <RiskManager 
        onRiskViolation={handleRiskViolation}
        totalPortfolioValue={getTotalPortfolioValue()}
      />

      {!autonomousMode && (
        <StrategyTemplates onApplyTemplate={handleApplyTemplate} />
      )}

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
