import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, StopCircle } from "lucide-react";
import { PoolSettings } from "@shared/schema";

interface MiningControlsProps {
  poolSettings?: PoolSettings;
  onStartMining: () => void;
  onStopMining: () => void;
  onUpdateSettings: (settings: Partial<PoolSettings>) => void;
}

export default function MiningControls({ 
  poolSettings, 
  onStartMining, 
  onStopMining, 
  onUpdateSettings 
}: MiningControlsProps) {
  const [intensity, setIntensity] = useState(poolSettings?.miningIntensity || "high");
  const [threads, setThreads] = useState([poolSettings?.cpuThreads || 4]);

  const handleIntensityChange = (value: string) => {
    setIntensity(value);
    onUpdateSettings({ miningIntensity: value });
  };

  const handleThreadsChange = (value: number[]) => {
    setThreads(value);
    onUpdateSettings({ cpuThreads: value[0] });
  };

  const intensityOptions = [
    { value: "low", label: "Low (25%)" },
    { value: "medium", label: "Medium (50%)" },
    { value: "high", label: "High (75%)" },
    { value: "maximum", label: "Maximum (100%)" }
  ];

  return (
    <Card className="bg-mining-gray border-mining-light">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PlayCircle className="text-green-400 mr-3" />
          Mining Controls
        </h3>
        
        <div className="space-y-4">
          {poolSettings?.isActive ? (
            <Button 
              onClick={onStopMining}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-medium"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Mining
            </Button>
          ) : (
            <Button 
              onClick={onStartMining}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Mining
            </Button>
          )}
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Mining Intensity</label>
            <Select value={intensity} onValueChange={handleIntensityChange}>
              <SelectTrigger className="w-full bg-mining-light border-mining-light text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-mining-light border-mining-light">
                {intensityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-mining-gray">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">CPU Threads</label>
            <Slider
              value={threads}
              onValueChange={handleThreadsChange}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span className="font-mono">{threads[0]} threads</span>
              <span>8</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
