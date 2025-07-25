import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalModalProps {
  bsvBalance: number;
  bsvAddress: string;
}

export default function WithdrawalModal({ bsvBalance, bsvAddress }: WithdrawalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState(bsvAddress);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Listen for global withdrawal modal trigger
  useState(() => {
    const modal = document.getElementById('withdrawalModal');
    if (modal) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            setIsOpen(!target.classList.contains('hidden'));
          }
        });
      });
      observer.observe(modal, { attributes: true });
      return () => observer.disconnect();
    }
  });

  const handleWithdraw = async () => {
    if (!withdrawalAddress || !withdrawalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || amount > bsvBalance) {
      toast({
        title: "Error",
        description: "Invalid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawal of ${amount.toFixed(8)} BSV has been initiated`,
      });
      
      setIsOpen(false);
      setWithdrawalAmount("");
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    const modal = document.getElementById('withdrawalModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  };

  // Render hidden modal for global trigger compatibility
  return (
    <>
      <div id="withdrawalModal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mining-gray rounded-xl p-6 w-full max-w-md border border-mining-light">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Withdraw BSV</h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-400">BSV Address</Label>
              <Input
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                className="w-full bg-mining-light border-mining-light text-white mt-2"
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              />
            </div>
            
            <div>
              <Label className="text-sm text-gray-400">Amount (BSV)</Label>
              <Input
                type="number"
                step="0.00000001"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-mining-light border-mining-light text-white mt-2"
                placeholder={bsvBalance.toFixed(8)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Available: <span className="text-bsv-yellow">{bsvBalance.toFixed(8)} BSV</span>
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw}
                className="flex-1 bg-bsv-yellow hover:bg-yellow-400 text-mining-dark font-medium"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-mining-gray border-mining-light text-white">
          <DialogHeader>
            <DialogTitle>Withdraw BSV</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-400">BSV Address</Label>
              <Input
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                className="w-full bg-mining-light border-mining-light text-white"
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              />
            </div>
            
            <div>
              <Label className="text-sm text-gray-400">Amount (BSV)</Label>
              <Input
                type="number"
                step="0.00000001"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-mining-light border-mining-light text-white"
                placeholder={bsvBalance.toFixed(8)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Available: <span className="text-bsv-yellow">{bsvBalance.toFixed(8)} BSV</span>
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw}
                className="flex-1 bg-bsv-yellow hover:bg-yellow-400 text-mining-dark font-medium"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
