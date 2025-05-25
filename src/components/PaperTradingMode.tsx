
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaperPortfolio } from '@/hooks/usePaperPortfolio';
import TradingModeToggle from './TradingModeToggle';
import LiveSimulationControl from './LiveSimulationControl';
import TradingModeStatus from './TradingModeStatus';
import PaperPortfolioStats from './PaperPortfolioStats';
import PaperPositions from './PaperPositions';
import { PaperTradingModeProps } from '@/types/paperTrading';

const PaperTradingMode = ({ onModeChange, cryptoList }: PaperTradingModeProps) => {
  const { toast } = useToast();
  const [isPaperMode, setIsPaperMode] = useState(true);
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  
  const { paperPortfolio, resetPaperPortfolio, executePaperTrade } = usePaperPortfolio(
    cryptoList, 
    isLiveSimulation
  );

  // Auto-enable live simulation for autonomous trading
  useEffect(() => {
    if (isPaperMode && !isLiveSimulation) {
      setIsLiveSimulation(true);
      toast({
        title: 'Live Simulation Started',
        description: 'AI bots are now actively trading with virtual money',
      });
    }
  }, [isPaperMode]);

  const handleModeChange = (enabled: boolean) => {
    setIsPaperMode(enabled);
    onModeChange(enabled);
    
    if (!enabled) {
      setIsLiveSimulation(false);
    }
  };

  // Expose paper trading function globally for bots to use
  useEffect(() => {
    if (isPaperMode) {
      (window as any).executePaperTrade = executePaperTrade;
    } else {
      delete (window as any).executePaperTrade;
    }
  }, [isPaperMode, cryptoList]);

  return (
    <Card className="trading-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-500" />
          Live Trading Simulation
        </h3>
        
        <TradingModeToggle 
          isPaperMode={isPaperMode}
          onModeChange={handleModeChange}
        />
      </div>
      
      <LiveSimulationControl
        isPaperMode={isPaperMode}
        isLiveSimulation={isLiveSimulation}
        onToggleLiveSimulation={setIsLiveSimulation}
      />
      
      <TradingModeStatus isPaperMode={isPaperMode} />
      
      {isPaperMode && (
        <div className="space-y-4">
          <PaperPortfolioStats 
            paperPortfolio={paperPortfolio}
            isLiveSimulation={isLiveSimulation}
          />
          
          <PaperPositions paperPortfolio={paperPortfolio} />
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={resetPaperPortfolio}
              className="text-xs"
            >
              Reset Virtual Portfolio
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PaperTradingMode;
