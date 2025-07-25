import { useEffect } from "react";
import MiningHeader from "@/components/mining/mining-header";
import MiningSidebar from "@/components/mining/mining-sidebar";
import MiningStats from "@/components/mining/mining-stats";
import PoolStatus from "@/components/mining/pool-status";
import MiningControls from "@/components/mining/mining-controls";
import RecentActivity from "@/components/mining/recent-activity";
import HashrateChart from "@/components/mining/hashrate-chart";
import WithdrawalModal from "@/components/mining/withdrawal-modal";
import { useMining } from "@/hooks/use-mining";
import { useWebSocket } from "@/hooks/use-websocket";

export default function MiningDashboard() {
  const { 
    miningStats, 
    poolSettings, 
    recentActivity, 
    isLoading, 
    startMining, 
    stopMining,
    updateSettings,
    refetchStats
  } = useMining(1); // Using user ID 1 for demo

  const { connectionStatus, lastMessage } = useWebSocket();

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'mining_stats_update' || lastMessage?.type === 'mining_activity_update') {
      refetchStats();
    }
  }, [lastMessage, refetchStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mining-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-bsv-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading mining dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mining-dark text-white">
      <MiningHeader 
        bsvBalance={miningStats?.bsvBalance || 0}
        connectionStatus={connectionStatus}
      />
      
      {/* Mobile-first layout */}
      <div className="block lg:flex">
        {/* Sidebar hidden on mobile, shown as collapsible */}
        <div className="hidden lg:block">
          <MiningSidebar 
            cpuUsage={miningStats?.cpuUsage || 0}
            temperature={miningStats?.temperature || 0}
            activeWorkers={miningStats?.activeWorkers || 0}
          />
        </div>
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <MiningStats miningStats={miningStats} />
          
          {/* Mobile system status card */}
          <div className="block lg:hidden mb-6">
            <div className="bg-mining-gray rounded-lg p-4 border border-mining-light">
              <h3 className="text-sm font-medium text-gray-300 mb-3">System Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-xs text-gray-400 block">CPU</span>
                  <span className={`text-sm font-mono ${(miningStats?.cpuUsage || 0) > 80 ? 'text-red-400' : (miningStats?.cpuUsage || 0) > 60 ? 'text-orange-400' : 'text-green-400'}`}>
                    {miningStats?.cpuUsage || 0}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Temp</span>
                  <span className={`text-sm font-mono ${(miningStats?.temperature || 0) > 80 ? 'text-red-400' : (miningStats?.temperature || 0) > 70 ? 'text-orange-400' : 'text-green-400'}`}>
                    {miningStats?.temperature || 0}°C
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Workers</span>
                  <span className="text-sm font-mono text-green-400">
                    {miningStats?.activeWorkers || 0}/4
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/* Mining Controls - Priority on mobile */}
            <MiningControls 
              poolSettings={poolSettings}
              onStartMining={startMining}
              onStopMining={stopMining}
              onUpdateSettings={updateSettings}
            />
            
            {/* Pool Status */}
            <PoolStatus 
              miningStats={miningStats}
              poolSettings={poolSettings}
            />
            
            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
            
            {/* Hashrate Chart */}
            <HashrateChart miningStats={miningStats} />
          </div>
        </main>
      </div>
      
      <WithdrawalModal 
        bsvBalance={miningStats?.bsvBalance || 0}
        bsvAddress={poolSettings?.bsvAddress || ""}
      />
    </div>
  );
}
