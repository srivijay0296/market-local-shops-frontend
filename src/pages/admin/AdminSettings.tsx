import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Save, 
  Database, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  RefreshCw,
  Percent,
  Coins
} from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [commissionRate, setCommissionRate] = useState(8.5);
  const [minPayout, setMinPayout] = useState(500);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [userRegistration, setUserRegistration] = useState(true);
  const [cacheExpiry, setCacheExpiry] = useState(3600);
  const [selectedGateway, setSelectedGateway] = useState("razorpay");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request to backend
    setTimeout(() => {
      setLoading(false);
      toast.success("Enterprise configuration successfully synced.");
    }, 1000);
  };

  const handleClearCache = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Invalidating distributed node cache...',
        success: 'Node cache cleared and reindexed.',
        error: 'Cache purge failed.',
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center glass-panel p-6 shadow-glass border border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground shadow-md">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">Global Control Panel</h1>
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-widest mt-1">Enterprise Configuration Hub</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Navigation / Categories */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider bg-primary/10 text-accent rounded-xl border border-primary/20 text-left">
              <Globe className="w-4 h-4" /> Marketplace
            </button>
            <button type="button" onClick={handleClearCache} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-card/80 hover:text-foreground rounded-xl border border-transparent text-left transition">
              <Database className="w-4 h-4" /> System & Cache
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/25 rounded-full blur-xl group-hover:bg-accent/35 transition-colors pointer-events-none" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Node Diagnostics</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">Sync and refresh postgres schemas to clear metadata cache issues.</p>
            <button 
              type="button"
              onClick={handleClearCache}
              className="w-full py-3 bg-white text-slate-950 rounded-xl font-bold uppercase text-[10px] tracking-wider hover:scale-[1.02] active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear System Cache
            </button>
          </div>
        </div>

        {/* Right Side: Settings Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Marketplace Config */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-glass relative overflow-hidden">
            <div className="flex items-center gap-2 pb-4 border-b border-border/60">
              <Coins className="w-5 h-5 text-accent" />
              <h3 className="font-display font-black text-foreground text-sm uppercase tracking-wide">Marketplace Parameters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-accent" /> Commission Rate (%)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={commissionRate}
                  onChange={e => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">
                  Min Payout Threshold (₹)
                </label>
                <input 
                  type="number" 
                  value={minPayout}
                  onChange={e => setMinPayout(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">
                Active Payment Gateway
              </label>
              <select
                value={selectedGateway}
                onChange={e => setSelectedGateway(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="cod">Cash on Delivery Only</option>
              </select>
            </div>
          </div>

          {/* System Control Settings */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-glass">
            <div className="flex items-center gap-2 pb-4 border-b border-border/60">
              <Shield className="w-5 h-5 text-accent" />
              <h3 className="font-display font-black text-foreground text-sm uppercase tracking-wide">System & Registration Security</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/40">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Maintenance Mode</h4>
                  <p className="text-[10px] text-foreground/50 mt-1">Lock down the marketplace for user access while updating backend servers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${maintenanceMode ? "bg-accent" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${maintenanceMode ? "translate-x-6" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/40">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Open Registration</h4>
                  <p className="text-[10px] text-foreground/50 mt-1">Allow new users to sign up and establish seller requests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUserRegistration(!userRegistration)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${userRegistration ? "bg-accent" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${userRegistration ? "translate-x-6" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/40">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Email Notifications</h4>
                  <p className="text-[10px] text-foreground/50 mt-1">Send transactional receipt emails and vendor approval warnings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${emailAlerts ? "bg-accent" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${emailAlerts ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full font-bold uppercase text-xs tracking-widest shadow-lg shadow-accent/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
