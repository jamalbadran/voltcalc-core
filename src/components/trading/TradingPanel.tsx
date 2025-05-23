
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AutoTradingEngine from '../AutoTradingEngine';
import ManualTradingPanel from './ManualTradingPanel';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

interface TradingPanelProps {
  cryptoList: CryptoCurrency[];
  selectedCrypto: CryptoCurrency;
  onTrade: (action: 'buy' | 'sell', symbol: string, amount: number) => void;
}

const TradingPanel = ({ cryptoList, selectedCrypto, onTrade }: TradingPanelProps) => {
  return (
    <Card className="trading-card p-6">
      <Tabs defaultValue="autonomous" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="autonomous" className="data-[state=active]:bg-gray-700">
            AI Autonomous Trading
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-gray-700">
            Manual Trading
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="autonomous" className="mt-6">
          <AutoTradingEngine 
            cryptoList={cryptoList}
            onTrade={onTrade}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualTradingPanel selectedCrypto={selectedCrypto} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TradingPanel;
