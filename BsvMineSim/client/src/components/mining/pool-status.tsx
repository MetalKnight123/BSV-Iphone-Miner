import { Card, CardContent } from "@/components/ui/card";
import { Server } from "lucide-react";
import { MiningStats, PoolSettings } from "@shared/schema";

interface PoolStatusProps {
  miningStats?: MiningStats;
  poolSettings?: PoolSettings;
}

export default function PoolStatus({ miningStats, poolSettings }: PoolStatusProps) {
  const workers = [
    { id: 1, hashrate: 0.58, status: 'active' },
    { id: 2, hashrate: 0.62, status: 'active' },
    { id: 3, hashrate: 0.55, status: 'active' },
    { id: 4, hashrate: 0.59, status: 'active' }
  ];

  return (
    <Card className="bg-mining-gray border-mining-light">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Server className="text-bsv-yellow mr-3" />
          Pool Connection Status
        </h3>
        
        <div className="space-y-4">
          {/* Primary Pool */}
          <div className="flex items-center justify-between p-4 bg-mining-light rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                miningStats?.connectionStatus === 'connected' 
                  ? 'connection-stable' 
                  : 'bg-red-500'
              }`}></div>
              <div>
                <p className="font-medium text-white">
                  {poolSettings?.poolUrl || 'pool.bsvmining.com:4334'}
                </p>
                <p className="text-sm text-gray-400">
                  Primary Pool - {miningStats?.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-green-400">
                Latency: {miningStats?.poolLatency || 45}ms
              </p>
              <p className="text-xs text-gray-400">Uptime: 99.8%</p>
            </div>
          </div>

          {/* Worker Status */}
          <div className="grid grid-cols-2 gap-4">
            {workers.map((worker) => (
              <div key={worker.id} className="p-3 bg-mining-dark rounded-lg border border-mining-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Worker #{worker.id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    worker.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {worker.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Hash: {worker.hashrate.toFixed(2)} MH/s
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
