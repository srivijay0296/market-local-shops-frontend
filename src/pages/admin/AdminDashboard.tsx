import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Terminal } from "lucide-react";
import { useAdminDashboard, SubTabType } from "@/hooks/useAdminDashboard";

// Lazy load heavy dashboard modules
const OverviewTab = lazy(() => import("@/components/admin/dashboard/OverviewTab").then(m => ({ default: m.OverviewTab })));
const BannersTab = lazy(() => import("@/components/admin/dashboard/BannersTab").then(m => ({ default: m.BannersTab })));
const BroadcastTab = lazy(() => import("@/components/admin/dashboard/BroadcastTab").then(m => ({ default: m.BroadcastTab })));
const SettingsTab = lazy(() => import("@/components/admin/dashboard/SettingsTab").then(m => ({ default: m.SettingsTab })));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
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
  } = useAdminDashboard();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing HQ Nexus...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShieldCheck className="w-16 h-16 text-destructive mb-4 animate-bounce" />
        <h2 className="text-2xl font-display font-black text-foreground uppercase tracking-tight">Access Denied</h2>
        <p className="text-foreground/50 text-sm mt-2">Administrator privileges required.</p>
        <button onClick={() => navigate("/")} className="mt-8 btn-primary px-8">Return Home</button>
      </div>
    );
  }

  if (loading && !stats.totalMarkets) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-600" /> Command Console
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Manage homepage content, check analytics, and configure gateway settings.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: "overview", label: "Overview" },
            { id: "banners", label: "Home Banners" },
            { id: "notifications", label: "Broadcast" },
            { id: "settings", label: "Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTabType)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>}>
            {activeTab === "overview" && <OverviewTab stats={stats} />}

            {activeTab === "banners" && (
              <BannersTab
                banners={banners}
                isAddingBanner={isAddingBanner}
                setIsAddingBanner={setIsAddingBanner}
                bannerForm={bannerForm}
                setBannerForm={setBannerForm}
                handleBannerCreate={handleBannerCreate}
                handleBannerToggle={handleBannerToggle}
                handleBannerDelete={handleBannerDelete}
                loading={loading}
              />
            )}

            {activeTab === "notifications" && (
              <BroadcastTab
                notifTitle={notifTitle}
                setNotifTitle={setNotifTitle}
                notifBody={notifBody}
                setNotifBody={setNotifBody}
                notifTarget={notifTarget}
                setNotifTarget={setNotifTarget}
                handleSendNotification={handleSendNotification}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab
                sysSettings={sysSettings}
                setSysSettings={setSysSettings}
              />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}