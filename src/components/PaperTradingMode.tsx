import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, DollarSign, TrendingUp, AlertCircle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaperPortfolio {
  cash: number;
  positions: {
    [symbol: string]: {
      amount: number;
      avgPrice: number;
      value: number;
    };
  };
  totalValue: number;
  totalPnL: number;
}

interface PaperTradingModeProps {
  onModeChange: (isPaperMode: boolean) => void;
  cryptoList: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
}

const PaperTradingMode = ({ onModeChange, cryptoList }: PaperTradingModeProps) => {
  const { toast } = useToast();
  const [isPaperMode, setIsPaperMode] = useState(true);
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  const [paperPortfolio, setPaperPortfolio] = useState<PaperPortfolio>({
    cash: 10000,
    positions: {},
    totalValue: 10000,
    totalPnL: 0
  });

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

  useEffect(() => {
    // Update portfolio values based on current prices
    const updatedPositions = { ...paperPortfolio.positions };
    let totalPositionValue = 0;

    Object.entries(updatedPositions).forEach(([symbol, position]) => {
      const crypto = cryptoList.find(c => c.symbol === symbol);
      if (crypto) {
        position.value = position.amount * crypto.price;
        totalPositionValue += position.value;
      }
    });

    const newTotalValue = paperPortfolio.cash + totalPositionValue;
    const newPnL = newTotalValue - 10000; // Starting capital

    setPaperPortfolio(prev => ({
      ...prev,
      positions: updatedPositions,
      totalValue: newTotalValue,
      totalPnL: newPnL
    }));
  }, [cryptoList]);

  const handleModeToggle = (enabled: boolean) => {
    setIsPaperMode(enabled);
    onModeChange(enabled);
    
    if (enabled) {
      setIsLiveSimulation(true);
      toast({
        title: 'Paper Trading Enabled',
        description: 'Live simulation with virtual money activated',
      });
    } else {
      setIsLiveSimulation(false);
      toast({
        title: 'Live Trading Enabled',
        description: 'Warning: Real money will be used for trades',
        variant: 'destructive'
      });
    }
  };

  const toggleLiveSimulation = () => {
    if (!isPaperMode) {
      toast({
        title: 'Enable Paper Trading First',
        description: 'Switch to paper trading mode to use live simulation',
        variant: 'destructive'
      });
      return;
    }

    setIsLiveSimulation(prev => {
      const newState = !prev;
      toast({
        title: newState ? 'Live Simulation Started' : 'Live Simulation Paused',
        description: newState ? 
          'AI bots are now actively trading with virtual money' : 
          'Virtual trading simulation paused',
      });
      return newState;
    });
  };

  const resetPaperPortfolio = () => {
    setPaperPortfolio({
      cash: 10000,
      positions: {},
      totalValue: 10000,
      totalPnL: 0
    });
    
    toast({
      title: 'Paper Portfolio Reset',
      description: 'Virtual portfolio has been reset to $10,000',
    });
  };

  const executePaperTrade = (action: 'buy' | 'sell', symbol: string, amount: number) => {
    if (!isLiveSimulation) return;
    
    const crypto = cryptoList.find(c => c.symbol === symbol);
    if (!crypto) return;

    setPaperPortfolio(prev => {
      const newPortfolio = { ...prev };
      
      if (action === 'buy') {
        const cost = amount;
        if (cost > newPortfolio.cash) {
          if (isLiveSimulation) {
            toast({
              title: 'Virtual Trade Rejected',
              description: `Insufficient funds: Need $${cost.toFixed(2)}, have $${newPortfolio.cash.toFixed(2)}`,
              variant: 'destructive'
            });
          }
          return prev;
        }
        
        const cryptoAmount = cost / crypto.price;
        newPortfolio.cash -= cost;
        
        if (!newPortfolio.positions[symbol]) {
          newPortfolio.positions[symbol] = {
            amount: 0,
            avgPrice: 0,
            value: 0
          };
        }
        
        const position = newPortfolio.positions[symbol];
        const totalAmount = position.amount + cryptoAmount;
        const totalCost = (position.amount * position.avgPrice) + cost;
        
        position.amount = totalAmount;
        position.avgPrice = totalCost / totalAmount;
        position.value = totalAmount * crypto.price;

        if (isLiveSimulation) {
          toast({
            title: 'Virtual Buy Executed',
            description: `Bought ${cryptoAmount.toFixed(6)} ${symbol} for $${cost.toFixed(2)}`,
          });
        }
        
      } else { // sell
        const position = newPortfolio.positions[symbol];
        if (!position || position.amount < amount) {
          if (isLiveSimulation) {
            toast({
              title: 'Virtual Trade Rejected',
              description: `Insufficient ${symbol} to sell`,
              variant: 'destructive'
            });
          }
          return prev;
        }
        
        const sellValue = amount * crypto.price;
        newPortfolio.cash += sellValue;
        position.amount -= amount;
        position.value = position.amount * crypto.price;
        
        if (position.amount < 0.000001) {
          delete newPortfolio.positions[symbol];
        }

        if (isLiveSimulation) {
          toast({
            title: 'Virtual Sell Executed',
            description: `Sold ${amount.toFixed(6)} ${symbol} for $${sellValue.toFixed(2)}`,
          });
        }
      }
      
      return newPortfolio;
    });
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
        
        <div className="flex items-center space-x-3">
          <span className="text-sm opacity-60">Real Money</span>
          <Switch
            checked={isPaperMode}
            onCheckedChange={handleModeToggle}
          />
          <span className="text-sm opacity-60">Virtual Money</span>
        </div>
      </div>
      
      {isPaperMode && (
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
      )}
      
      {!isPaperMode && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              Live Trading Active - Real Money at Risk
            </span>
          </div>
          <p className="text-xs opacity-80">
            Trades will use real money. Switch to virtual money mode for safe testing.
          </p>
        </div>
      )}
      
      {isPaperMode && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-lg font-bold ${isLiveSimulation ? 'text-green-400' : 'text-gray-400'}`}>
                ${paperPortfolio.totalValue.toFixed(2)}
              </div>
              <div className="text-xs opacity-60">Virtual Portfolio Value</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${isLiveSimulation ? 'text-white' : 'text-gray-400'}`}>
                ${paperPortfolio.cash.toFixed(2)}
              </div>
              <div className="text-xs opacity-60">Available Virtual Cash</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${
                paperPortfolio.totalPnL >= 0 ? 
                (isLiveSimulation ? 'text-green-400' : 'text-gray-400') : 
                (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
              }`}>
                {paperPortfolio.totalPnL >= 0 ? '+' : ''}${paperPortfolio.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs opacity-60">Virtual P&L</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${
                paperPortfolio.totalPnL >= 0 ? 
                (isLiveSimulation ? 'text-green-400' : 'text-gray-400') : 
                (isLiveSimulation ? 'text-red-400' : 'text-gray-400')
              }`}>
                {paperPortfolio.totalPnL >= 0 ? '+' : ''}{((paperPortfolio.totalPnL / 10000) * 100).toFixed(2)}%
              </div>
              <div className="text-xs opacity-60">Virtual Return %</div>
            </div>
          </div>
          
          {Object.keys(paperPortfolio.positions).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Virtual Positions</h4>
              <div className="space-y-2">
                {Object.entries(paperPortfolio.positions).map(([symbol, position]) => (
                  <div key={symbol} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <div>
                      <span className="font-medium">{symbol}</span>
                      <span className="text-xs opacity-60 ml-2">
                        {position.amount.toFixed(6)} @ ${position.avgPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${position.value.toFixed(2)}</div>
                      <div className="text-xs text-green-400">
                        +{(((position.value - (position.amount * position.avgPrice)) / (position.amount * position.avgPrice)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
