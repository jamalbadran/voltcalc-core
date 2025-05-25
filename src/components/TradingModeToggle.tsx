
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface TradingModeToggleProps {
  isPaperMode: boolean;
  onModeChange: (isPaperMode: boolean) => void;
}

const TradingModeToggle = ({ isPaperMode, onModeChange }: TradingModeToggleProps) => {
  const { toast } = useToast();

  const handleModeToggle = (enabled: boolean) => {
    onModeChange(enabled);
    
    if (enabled) {
      toast({
        title: 'Paper Trading Enabled',
        description: 'Live simulation with virtual money activated',
      });
    } else {
      toast({
        title: 'Live Trading Enabled',
        description: 'Warning: Real money will be used for trades',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm opacity-60">Real Money</span>
      <Switch
        checked={isPaperMode}
        onCheckedChange={handleModeToggle}
      />
      <span className="text-sm opacity-60">Virtual Money</span>
    </div>
  );
};

export default TradingModeToggle;
