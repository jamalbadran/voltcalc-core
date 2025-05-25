
import { PaperPortfolio } from '@/types/paperTrading';

interface PaperPositionsProps {
  paperPortfolio: PaperPortfolio;
}

const PaperPositions = ({ paperPortfolio }: PaperPositionsProps) => {
  if (Object.keys(paperPortfolio.positions).length === 0) {
    return null;
  }

  return (
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
  );
};

export default PaperPositions;
