
import { Button } from '@/components/ui/button';
import { Play, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveSimulationControlProps {
  isPaperMode: boolean;
  isLiveSimulation: boolean;
  onToggleLiveSimulation: (enabled: boolean) => void;
}

const LiveSimulationControl = ({ 
  isPaperMode, 
  isLiveSimulation, 
  onToggleLiveSimulation 
}: LiveSimulationControlProps) => {
  const { toast } = useToast();

  const toggleLiveSimulation = () => {
    if (!isPaperMode) {
      toast({
        title: 'Enable Paper Trading First',
        description: 'Switch to paper trading mode to use live simulation',
        variant: 'destructive'
      });
      return;
    }

    const newState = !isLiveSimulation;
    onToggleLiveSimulation(newState);
    
    toast({
      title: newState ? 'Live Simulation Started' : 'Live Simulation Paused',
      description: newState ? 
        'AI bots are now actively trading with virtual money' : 
        'Virtual trading simulation paused',
    });
  };

  if (!isPaperMode) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Live Simulation Control</span>
        <Button
          variant={isLiveSimulation ? "destructive" : "default"}
          size="sm"
          onClick={toggleLiveSimulation}
          className="flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isLiveSimulation ? 'Pause Simulation' : 'Start Live Simulation'}</span>
        </Button>
      </div>
      
      {isLiveSimulation ? (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">
              Live Simulation Active - AI Trading with Virtual Money
            </span>
          </div>
          <p className="text-xs opacity-80">
            Autonomous AI bots are actively trading in real-time using virtual funds. All trades are simulated with no financial risk.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Live Simulation Paused
            </span>
          </div>
          <p className="text-xs opacity-80">
            Click "Start Live Simulation" to begin autonomous AI trading with virtual money.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveSimulationControl;
