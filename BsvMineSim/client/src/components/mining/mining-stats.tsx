import { Card, CardContent } from "@/components/ui/card";
import { Zap, Share, Puzzle, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { MiningStats as MiningStatsType } from "@shared/schema";

interface MiningStatsProps {
  miningStats?: MiningStatsType;
}

export default function MiningStats({ miningStats }: MiningStatsProps) {
  if (!miningStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-mining-gray border-mining-light">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-mining-light rounded mb-4"></div>
                <div className="h-8 bg-mining-light rounded mb-2"></div>
                <div className="h-3 bg-mining-light rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
      {/* Hashrate Card */}
      <Card className="bg-mining-gray border-mining-light">
        <CardContent className="p-3 lg:p-6">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400">Hashrate</h3>
            <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-bsv-yellow" />
          </div>
          <div className="text-lg lg:text-2xl font-bold font-mono text-white">
            {miningStats.hashrate.toFixed(2)}
          </div>
          <div className="text-xs lg:text-sm text-green-400 mt-1 lg:mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            MH/s
          </div>
        </CardContent>
      </Card>

      {/* Shares Submitted */}
      <Card className="bg-mining-gray border-mining-light">
        <CardContent className="p-3 lg:p-6">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400">Shares</h3>
            <Share className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" />
          </div>
          <div className="text-lg lg:text-2xl font-bold font-mono text-white">
            {miningStats.sharesSubmitted.toLocaleString()}
          </div>
          <div className="text-xs lg:text-sm text-gray-400 mt-1 lg:mt-2">
            <span className="text-green-400">{miningStats.sharesAccepted}</span>/<span className="text-red-400">{miningStats.sharesRejected}</span>
          </div>
        </CardContent>
      </Card>

      {/* Network Difficulty */}
      <Card className="bg-mining-gray border-mining-light">
        <CardContent className="p-3 lg:p-6">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400">Difficulty</h3>
            <Puzzle className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
          </div>
          <div className="text-lg lg:text-2xl font-bold font-mono text-white">
            {miningStats.networkDifficulty}
          </div>
          <div className="text-xs lg:text-sm text-orange-400 mt-1 lg:mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +2.3%
          </div>
        </CardContent>
      </Card>

      {/* Earnings Today */}
      <Card className="bg-mining-gray border-mining-light">
        <CardContent className="p-3 lg:p-6">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400">Earnings</h3>
            <Coins className="h-4 w-4 lg:h-5 lg:w-5 text-bsv-yellow" />
          </div>
          <div className="text-sm lg:text-xl font-bold font-mono text-bsv-yellow">
            {miningStats.earningsToday.toFixed(6)}
          </div>
          <div className="text-xs lg:text-sm text-gray-400 mt-1 lg:mt-2">
            BSV Today
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
