import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { MiningStats } from "@shared/schema";

interface HashrateChartProps {
  miningStats?: MiningStats;
}

export default function HashrateChart({ miningStats }: HashrateChartProps) {
  const [timeframe, setTimeframe] = useState("24H");
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);

  // Simulate hashrate history for chart
  useEffect(() => {
    const generateHistory = () => {
      const baseHashrate = miningStats?.hashrate || 2.34;
      const history = [];
      
      for (let i = 0; i < 24; i++) {
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        const value = Math.max(0, baseHashrate + variation);
        history.push(parseFloat(value.toFixed(2)));
      }
      
      setHashrateHistory(history);
    };

    generateHistory();
    const interval = setInterval(generateHistory, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [miningStats?.hashrate]);

  const maxHashrate = Math.max(...hashrateHistory, 1);
  const timeLabels = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date().getHours() - (23 - i);
    return `${hour < 0 ? hour + 24 : hour}:00`;
  });

  return (
    <Card className="bg-mining-gray border-mining-light">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart3 className="text-bsv-yellow mr-3" />
            Hashrate Performance ({timeframe})
          </h3>
          <div className="flex space-x-2">
            {["24H", "7D", "30D"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className={timeframe === period 
                  ? "bg-bsv-yellow text-mining-dark" 
                  : "text-gray-400 hover:text-white"
                }
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="hashrate-chart bg-mining-dark rounded-lg border border-mining-light p-4">
          {hashrateHistory.length > 0 ? (
            <div className="relative h-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                <span>{maxHashrate.toFixed(1)}</span>
                <span>{(maxHashrate * 0.75).toFixed(1)}</span>
                <span>{(maxHashrate * 0.5).toFixed(1)}</span>
                <span>{(maxHashrate * 0.25).toFixed(1)}</span>
                <span>0.0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-12 h-full relative">
                <svg className="w-full h-full" viewBox="0 0 1000 200">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 50}
                      x2="1000"
                      y2={i * 50}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Hashrate line */}
                  <path
                    d={`M ${hashrateHistory.map((rate, i) => 
                      `${(i / (hashrateHistory.length - 1)) * 1000},${200 - (rate / maxHashrate) * 200}`
                    ).join(' L ')}`}
                    fill="none"
                    stroke="var(--bsv-yellow)"
                    strokeWidth="2"
                  />
                  
                  {/* Data points */}
                  {hashrateHistory.map((rate, i) => (
                    <circle
                      key={i}
                      cx={(i / (hashrateHistory.length - 1)) * 1000}
                      cy={200 - (rate / maxHashrate) * 200}
                      r="3"
                      fill="var(--bsv-yellow)"
                    />
                  ))}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 w-full flex justify-between text-xs text-gray-400">
                  <span>{timeLabels[0]}</span>
                  <span>{timeLabels[Math.floor(timeLabels.length / 2)]}</span>
                  <span>{timeLabels[timeLabels.length - 1]}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-gray-400">
              <div>
                <BarChart3 className="text-4xl mb-4 mx-auto" />
                <p>Loading hashrate data...</p>
                <p className="text-sm">Real-time performance visualization</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
