import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { MiningActivity } from "@shared/schema";

interface RecentActivityProps {
  activities: MiningActivity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'share_accepted':
        return 'bg-green-400';
      case 'share_rejected':
        return 'bg-red-400';
      case 'pool_connected':
      case 'mining_started':
        return 'bg-bsv-yellow';
      case 'pool_disconnected':
      case 'mining_stopped':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: Date | string | null) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-mining-gray border-mining-light">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="text-blue-400 mr-3" />
          Recent Activity
        </h3>
        
        <div className="space-y-3 text-sm">
          {activities.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <p>No recent activity</p>
            </div>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-mining-light last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.activityType)}`}></div>
                  <span className="text-gray-300">{activity.message}</span>
                </div>
                <span className="text-gray-400 font-mono">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
