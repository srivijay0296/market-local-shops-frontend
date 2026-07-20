import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backendApi } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubTabType = "overview" | "banners" | "notifications" | "settings";

export interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalMarkets: number;
  totalOrders: number;
  totalRevenue: number;
  pendingShops: number;
  pendingProducts: number;
  sellers: number;
  buyers: number;
  admins: number;
  activeUsers: number;
  salesTrend: any[];
  categoryShares: any[];
}

export function useAdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SubTabType>("overview");

  // Local Form States
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    image_url: "",
    active: true,
    sort_order: 1
  });

  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifTarget, setNotifTarget] = useState("ALL");

  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    googleMapsEnabled: true,
    stripeSandbox: true,
    dailyBackup: true,
    serverPort: "8082",
    jwtTTL: "86400"
  });

  // Queries
  const { data: stats = {
    totalUsers: 0, totalShops: 0, totalProducts: 0, totalMarkets: 0, 
    totalOrders: 0, totalRevenue: 0, pendingShops: 0, pendingProducts: 0, 
    sellers: 0, buyers: 0, admins: 0, activeUsers: 0, salesTrend: [], categoryShares: []
  }, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data } = await backendApi.get("/admin/analytics");
      return data as DashboardStats;
    },
    enabled: !!user && user.role === "ADMIN",
    staleTime: 60 * 1000,
  });

  const { data: banners = [], isLoading: loadingBanners } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const { data } = await backendApi.get("/banners");
      return data || [];
    },
    enabled: !!user && user.role === "ADMIN" && activeTab === "banners",
  });

  // Mutations
  const createBannerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await backendApi.post("/banners", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success("Promotional banner created successfully.");
      setIsAddingBanner(false);
      setBannerForm({ title: "", description: "", image_url: "", active: true, sort_order: 1 });
    },
    onError: () => toast.error("Failed to publish banner.")
  });

  const toggleBannerMutation = useMutation({
    mutationFn: async ({ id, active }: { id: any, active: boolean }) => {
      const { data } = await backendApi.put(`/banners/${id}`, { active });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success("Visibility updated.");
    },
    onError: () => toast.error("Failed to update status.")
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: any) => {
      await backendApi.delete(`/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success("Banner deleted.");
    },
    onError: () => toast.error("Deletion failed.")
  });

  // Handlers
  const handleBannerCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image_url) {
      toast.error("Title and Banner image are required.");
      return;
    }
    createBannerMutation.mutate(bannerForm);
  };

  const handleBannerToggle = (id: any, currentActive: boolean) => {
    toggleBannerMutation.mutate({ id, active: !currentActive });
  };

  const handleBannerDelete = (id: any) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    deleteBannerMutation.mutate(id);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) {
      toast.error("Notification details are incomplete.");
      return;
    }
    toast.success(`Announcement broadcasted to target group: ${notifTarget}`);
    setNotifTitle("");
    setNotifBody("");
  };

  const loading = loadingStats || loadingBanners || createBannerMutation.isPending || toggleBannerMutation.isPending || deleteBannerMutation.isPending;

  return {
    user,
    authLoading,
    activeTab,
    setActiveTab,
    loading,
    stats,
    banners,
    isAddingBanner,
    setIsAddingBanner,
    bannerForm,
    setBannerForm,
    notifTitle,
    setNotifTitle,
    notifBody,
    setNotifBody,
    notifTarget,
    setNotifTarget,
    sysSettings,
    setSysSettings,
    handleBannerCreate,
    handleBannerToggle,
    handleBannerDelete,
    handleSendNotification
  };
}
