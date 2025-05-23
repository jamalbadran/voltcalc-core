
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface HeaderProps {
  currentTime: Date;
}

const Header = ({ currentTime }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold trading-gradient bg-clip-text text-transparent">
          AI CryptoTrader Pro
        </h1>
        <p className="text-sm opacity-60">
          {currentTime.toLocaleString()} • Powered by Machine Learning
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="border-green-500 text-green-500">
          <Activity className="w-3 h-3 mr-1" />
          AI Active
        </Badge>
      </div>
    </div>
  );
};

export default Header;
