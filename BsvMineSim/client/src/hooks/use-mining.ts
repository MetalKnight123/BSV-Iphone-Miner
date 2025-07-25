import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MiningStats, MiningActivity, PoolSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMining(userId: number) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch mining stats
  const { data: miningStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<MiningStats>({
    queryKey: ['/api/mining/stats', userId],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery<MiningActivity[]>({
    queryKey: ['/api/mining/activity', userId],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch pool settings
  const { data: poolSettings, isLoading: settingsLoading } = useQuery<PoolSettings>({
    queryKey: ['/api/mining/pool-settings', userId],
  });

  // Start mining mutation
  const startMiningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/mining/start/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mining Started",
        description: "BSV mining has been initiated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/pool-settings', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/activity', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Mining",
        description: error.message || "An error occurred while starting mining",
        variant: "destructive",
      });
    },
  });

  // Stop mining mutation
  const stopMiningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/mining/stop/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mining Stopped",
        description: "BSV mining has been stopped successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/pool-settings', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/activity', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Stop Mining",
        description: error.message || "An error occurred while stopping mining",
        variant: "destructive",
      });
    },
  });

  // Update pool settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<PoolSettings>) => {
      const response = await apiRequest('POST', `/api/mining/pool-settings/${userId}`, settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mining/pool-settings', userId] });
      toast({
        title: "Settings Updated",
        description: "Mining settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Settings",
        description: error.message || "An error occurred while updating settings",
        variant: "destructive",
      });
    },
  });

  const startMining = useCallback(async () => {
    if (isStarting || startMiningMutation.isPending) return;
    setIsStarting(true);
    try {
      await startMiningMutation.mutateAsync();
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, startMiningMutation]);

  const stopMining = useCallback(async () => {
    if (isStopping || stopMiningMutation.isPending) return;
    setIsStopping(true);
    try {
      await stopMiningMutation.mutateAsync();
    } finally {
      setIsStopping(false);
    }
  }, [isStopping, stopMiningMutation]);

  const updateSettings = useCallback(async (settings: Partial<PoolSettings>) => {
    await updateSettingsMutation.mutateAsync(settings);
  }, [updateSettingsMutation]);

  return {
    miningStats,
    recentActivity: recentActivity || [],
    poolSettings,
    isLoading: statsLoading || activityLoading || settingsLoading,
    isStarting: isStarting || startMiningMutation.isPending,
    isStopping: isStopping || stopMiningMutation.isPending,
    startMining,
    stopMining,
    updateSettings,
    refetchStats,
  };
}
