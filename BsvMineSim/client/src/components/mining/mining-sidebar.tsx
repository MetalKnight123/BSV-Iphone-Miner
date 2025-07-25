import { BarChart3, Settings, History, Server, Gauge } from "lucide-react";

interface MiningSidebarProps {
  cpuUsage: number;
  temperature: number;
  activeWorkers: number;
}

export default function MiningSidebar({ cpuUsage, temperature, activeWorkers }: MiningSidebarProps) {
  return (
    <aside className="w-64 bg-mining-gray h-screen-minus-header border-r border-mining-light">
      <nav className="p-4 space-y-2">
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-mining-light text-bsv-yellow">
          <Gauge className="h-5 w-5" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-mining-light transition-colors text-gray-400 hover:text-white">
          <Server className="h-5 w-5" />
          <span>Pool Settings</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-mining-light transition-colors text-gray-400 hover:text-white">
          <BarChart3 className="h-5 w-5" />
          <span>Statistics</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-mining-light transition-colors text-gray-400 hover:text-white">
          <History className="h-5 w-5" />
          <span>Mining History</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-mining-light transition-colors text-gray-400 hover:text-white">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </a>
      </nav>
      
      <div className="p-4 mt-8">
        <div className="bg-mining-light rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">CPU Usage</span>
              <span className={`text-sm font-mono ${cpuUsage > 80 ? 'text-red-400' : cpuUsage > 60 ? 'text-orange-400' : 'text-green-400'}`}>
                {cpuUsage}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Temperature</span>
              <span className={`text-sm font-mono ${temperature > 80 ? 'text-red-400' : temperature > 70 ? 'text-orange-400' : 'text-green-400'}`}>
                {temperature}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Workers</span>
              <span className="text-sm font-mono text-green-400">
                {activeWorkers}/4
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
