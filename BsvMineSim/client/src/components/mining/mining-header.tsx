import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Wallet, Wifi, WifiOff } from "lucide-react";

interface MiningHeaderProps {
  bsvBalance: number;
  connectionStatus: string;
}

export default function MiningHeader({ bsvBalance, connectionStatus }: MiningHeaderProps) {
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const handleWithdraw = () => {
    setShowWithdrawal(true);
    // Trigger withdrawal modal
    const modal = document.getElementById('withdrawalModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  };

  return (
    <header className="bg-mining-gray border-b border-mining-light px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-bsv-yellow rounded-xl flex items-center justify-center ticker-animation shadow-lg">
            <span className="text-mining-dark text-xl lg:text-2xl font-black">B</span>
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-bsv-yellow">BSV iPhone Miner</h1>
            <p className="text-gray-400 text-xs lg:text-sm hidden sm:block">Mobile BSV Mining Experience</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 lg:space-x-6">
          {/* Connection Status - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-green"></div>
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-400">Connecting</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-400">Offline</span>
              </>
            )}
          </div>
          
          {/* Connection Status Dot - Mobile only */}
          <div className="block md:hidden">
            {connectionStatus === 'connected' ? (
              <div className="w-4 h-4 bg-green-500 rounded-full pulse-green"></div>
            ) : connectionStatus === 'connecting' ? (
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">BSV Balance</p>
            <p className="text-sm lg:text-lg font-mono text-bsv-yellow">
              {bsvBalance.toFixed(6)}
            </p>
          </div>
          
          <Button 
            onClick={handleWithdraw}
            className="bg-bsv-yellow text-mining-dark hover:bg-yellow-400 font-medium text-sm lg:text-base px-3 lg:px-4"
          >
            <Wallet className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Withdraw</span>
            <span className="sm:hidden">$</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
