import { useState, useEffect, useRef } from "react";
import { 
  Terminal, Activity, Zap, Shield, Database, 
  Cpu, HardDrive, Globe, RefreshCcw, Bell,
  ChevronRight, Lock, Server, Layers, BarChart3,
  CheckCircle2, AlertCircle, Clock, Wind, Maximize2,
  Settings, Search, Filter, Download, Trash2, Power
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface ServerStatus {
  status: string;
  environment: string;
  port: number;
  time: string;
  latency?: number;
  memory?: {
    rss: string;
    heap: string;
  };
  uptime?: number;
}

export default function AdvancedServerControl() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'error' | 'warn'}[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'endpoints'>('metrics');
  
  const fetchHealth = async () => {
    const startTime = Date.now();
    try {
      const { data } = await api.get('/health');
      const latency = Date.now() - startTime;
      setStatus({ ...data, latency });
      setLastCheck(new Date());
      addLog(`[SYSTEM] Pulse detected: ${latency}ms latency`, 'info');
    } catch (err: any) {
      setStatus(null);
      addLog(`[CRITICAL] Pulse lost: ${err.message}`, 'error');
      toast.error("Nexus Core Connection Severed");
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string, type: 'info' | 'error' | 'warn' = 'info') => {
    const newLog = {
      time: new Date().toLocaleTimeString(),
      msg,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // 10s pulse for high-res monitoring
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        
        {/* --- NAVIGATION BAR --- */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white uppercase italic">
                  Nexus<span className="text-indigo-500">Node</span>
                  <span className="text-[10px] ml-2 font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full not-italic">V2.5</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Control Surface</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5 ml-8">
              <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} icon={<Activity size={14} />} label="Metrics" />
              <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal size={14} />} label="Logs" />
              <TabButton active={activeTab === 'endpoints'} onClick={() => setActiveTab('endpoints')} icon={<Globe size={14} />} label="Network" />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <div className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {status ? 'Connection Stable' : 'Link Failure'}
              </span>
            </div>
            
            <button 
              onClick={() => {setLoading(true); fetchHealth();}}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
              title="Manual Sync"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-hidden p-8 flex gap-8">
          
          {/* LEFT COLUMN: ACTIVE VIEW */}
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 scrollbar-hide">
            
            {activeTab === 'metrics' && (
              <>
                {/* HUD CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="Current Latency" 
                    value={status?.latency ? `${status.latency}ms` : '---'} 
                    trend={status?.latency && status.latency < 50 ? 'Optimal' : 'Standard'}
                    trendColor={status?.latency && status.latency < 50 ? 'text-emerald-400' : 'text-amber-400'}
                    icon={<Zap className="text-amber-400" />}
                  />
                  <StatCard 
                    label="Uptime Percent" 
                    value="99.98%" 
                    trend="+0.02%"
                    trendColor="text-emerald-400"
                    icon={<Wind className="text-indigo-400" />}
                  />
                  <StatCard 
                    label="Active Sessions" 
                    value="1,284" 
                    trend="High Load"
                    trendColor="text-rose-400"
                    icon={<Layers className="text-purple-400" />}
                  />
                  <StatCard 
                    label="System Health" 
                    value={status ? 'Nominal' : 'Error'} 
                    trend={status ? 'Stable' : 'Unstable'}
                    trendColor={status ? 'text-emerald-400' : 'text-rose-400'}
                    icon={<Shield className="text-emerald-400" />}
                  />
                </div>

                {/* DETAILED MONITORING */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* RESOURCE UTILIZATION */}
                  <GlassPanel title="Resource Allocation" icon={<Cpu className="text-indigo-400" />}>
                    <div className="space-y-8 py-4">
                      <ResourceBar 
                        label="Heap Memory" 
                        value={status?.memory?.heap || '0MB'} 
                        percentage={34} 
                        color="bg-indigo-500" 
                      />
                      <ResourceBar 
                        label="RSS Memory Usage" 
                        value={status?.memory?.rss || '0MB'} 
                        percentage={62} 
                        color="bg-purple-500" 
                      />
                      <ResourceBar 
                        label="CPU Cluster Load" 
                        value="12.4%" 
                        percentage={12} 
                        color="bg-emerald-500" 
                      />
                       <ResourceBar 
                        label="Disk I/O Wait" 
                        value="2.1ms" 
                        percentage={8} 
                        color="bg-amber-500" 
                      />
                    </div>
                  </GlassPanel>

                  {/* LIVE CHART SIMULATION */}
                  <GlassPanel title="Throughput Spectrum" icon={<BarChart3 className="text-purple-400" />}>
                     <div className="h-[240px] flex items-end gap-1.5 py-4">
                        {[40, 60, 45, 90, 65, 30, 80, 55, 70, 45, 60, 85, 40, 95, 20, 50, 75, 60, 45, 100].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-sm animate-in slide-in-from-bottom duration-1000" 
                            style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                          />
                        ))}
                     </div>
                     <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>T-30min</span>
                        <span>Synchronized Pulse</span>
                        <span>Now</span>
                     </div>
                  </GlassPanel>
                </div>

                {/* SYSTEM CONFIGURATION */}
                <GlassPanel title="Calibration & Environment" icon={<Settings className="text-slate-400" />}>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <ConfigItem label="Environment" value={status?.environment || '---'} highlight />
                      <ConfigItem label="Node Version" value="v20.11.0" />
                      <ConfigItem label="Port Link" value={status?.port?.toString() || '---'} />
                      <ConfigItem label="Cluster" value="Nexus-Alpha" />
                      <ConfigItem label="Region" value="Localhost" />
                      <ConfigItem label="Runtime" value="Express" />
                      <ConfigItem label="Architecture" value="Monolith" />
                      <ConfigItem label="Secure" value="True" />
                   </div>
                </GlassPanel>
              </>
            )}

            {activeTab === 'logs' && (
               <div className="flex-1 flex flex-col bg-black/60 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Filter log stream..." 
                        className="bg-transparent border-none outline-none text-xs w-64 placeholder:text-slate-600 font-medium"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase transition-colors">Export .log</button>
                      <button className="px-3 py-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-black uppercase transition-colors">Clear</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed space-y-2">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex gap-4 group hover:bg-white/5 p-1 rounded transition-colors ${log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}`}>
                        <span className="text-slate-600 shrink-0">[{log.time}]</span>
                        <span className="text-slate-500 shrink-0 font-bold">{log.type.toUpperCase()}</span>
                        <span className="group-hover:text-white transition-colors">{log.msg}</span>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {activeTab === 'endpoints' && (
              <GlassPanel title="Network Operations" icon={<Globe size={18} />}>
                <div className="overflow-x-auto py-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="pb-4 pl-4">Method</th>
                        <th className="pb-4">Endpoint Path</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Latency</th>
                        <th className="pb-4 text-right pr-4">Load</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-medium">
                      <EndpointRow method="GET" path="/api/health" status="200" time="4ms" load={12} />
                      <EndpointRow method="GET" path="/api/products" status="200" time="42ms" load={68} />
                      <EndpointRow method="POST" path="/api/auth/sync" status="201" time="156ms" load={45} />
                      <EndpointRow method="GET" path="/api/shops" status="200" time="28ms" load={30} />
                      <EndpointRow method="PUT" path="/api/users/profile" status="200" time="84ms" load={22} />
                      <EndpointRow method="POST" path="/api/orders" status="403" time="12ms" load={9} />
                    </tbody>
                  </table>
                </div>
              </GlassPanel>
            )}
          </div>

          {/* RIGHT COLUMN: ACTION PANEL */}
          <div className="w-80 flex flex-col gap-6">
             {/* CRITICAL ACTIONS */}
             <div className="p-6 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 space-y-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-500">Emergency Protocol</h3>
                </div>
                <p className="text-[10px] text-rose-400/80 font-bold uppercase leading-relaxed">
                  Severe system anomalies detected. Authorization required for state mutation.
                </p>
                <div className="space-y-3">
                  <ActionButton icon={<Trash2 size={14} />} label="Purge Memory Cache" variant="danger" />
                  <ActionButton icon={<RefreshCcw size={14} />} label="Soft Reload Cluster" variant="outline" />
                  <ActionButton icon={<Power size={14} />} label="Force Termination" variant="danger" />
                </div>
             </div>

             {/* NOTIFICATIONS / ALERTS */}
             <div className="flex-1 bg-white/5 rounded-[2rem] border border-white/5 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Alerts</h3>
                   <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 text-[9px] flex items-center justify-center rounded-full font-black">2</span>
                </div>
                <div className="space-y-4 flex-1">
                   <AlertItem 
                      type="warn" 
                      title="Memory Spike" 
                      time="12m ago" 
                      msg="Cluster node B exceeded 80% utilization during product sync." 
                   />
                   <AlertItem 
                      type="info" 
                      title="Auto-Scaling" 
                      time="45m ago" 
                      msg="New worker node provisioned for high-traffic surge." 
                   />
                </div>
                <button className="w-full mt-6 py-3 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  View Full History
                </button>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, trend, trendColor, icon }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black text-white italic tracking-tighter">{value}</h4>
        <span className={`text-[9px] font-bold uppercase mb-1 ${trendColor}`}>{trend}</span>
      </div>
    </div>
  );
}

function GlassPanel({ title, icon, children }: any) {
  return (
    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            {icon}
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{title}</h3>
        </div>
        <Maximize2 size={14} className="text-slate-600 hover:text-indigo-400 cursor-pointer transition-colors" />
      </div>
      {children}
    </div>
  );
}

function ResourceBar({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

function ConfigItem({ label, value, highlight = false }: any) {
  return (
    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[11px] font-black ${highlight ? 'text-indigo-400' : 'text-slate-300'}`}>{value}</p>
    </div>
  );
}

function EndpointRow({ method, path, status, time, load }: any) {
  return (
    <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
      <td className="py-4 pl-4">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {method}
        </span>
      </td>
      <td className="py-4 font-mono text-slate-300">{path}</td>
      <td className="py-4">
        <span className={`flex items-center gap-1.5 ${status.startsWith('2') ? 'text-emerald-400' : 'text-rose-400'}`}>
          <div className={`w-1 h-1 rounded-full ${status.startsWith('2') ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {status}
        </span>
      </td>
      <td className="py-4 text-slate-500 font-bold italic tracking-tight">{time}</td>
      <td className="py-4 pr-4">
        <div className="flex items-center justify-end gap-2">
          <div className="flex-1 h-1 w-12 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-slate-700" style={{ width: `${load}%` }} />
          </div>
          <span className="text-slate-600">{load}%</span>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({ icon, label, variant }: any) {
  return (
    <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${variant === 'danger' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500' : 'border border-rose-500/30 text-rose-500 hover:bg-rose-500/10'}`}>
      {icon}
      {label}
    </button>
  );
}

function AlertItem({ type, title, time, msg }: any) {
  return (
    <div className={`p-4 rounded-2xl border ${type === 'warn' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`text-[10px] font-black uppercase ${type === 'warn' ? 'text-amber-400' : 'text-indigo-400'}`}>{title}</h4>
        <span className="text-[9px] text-slate-600 font-bold">{time}</span>
      </div>
      <p className="text-[10px] text-slate-400 leading-normal font-medium">{msg}</p>
    </div>
  );
}
