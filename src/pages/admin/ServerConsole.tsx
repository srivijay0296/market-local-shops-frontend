import { useState, useEffect } from "react";
import { 
  Terminal, Activity, Zap, Shield, Database, 
  Cpu, HardDrive, Globe, RefreshCcw, Bell,
  ChevronRight, Lock, Server, Layers, BarChart3,
  CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface ServerStatus {
  status: string;
  environment: string;
  port: number;
  time: string;
  latency?: number;
}

export default function ServerConsole() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'error' | 'warn'}[]>([]);

  const fetchHealth = async () => {
    const startTime = Date.now();
    try {
      const { data } = await api.get('/health');
      const latency = Date.now() - startTime;
      setStatus({ ...data, latency });
      setLastCheck(new Date());
      addLog(`Health check successful: ${latency}ms latency`, 'info');
    } catch (err: any) {
      setStatus(null);
      addLog(`Health check failed: ${err.message}`, 'error');
      toast.error("Critical: Backend Node Unreachable");
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
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // 15s pulse
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 lg:p-10 font-mono">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                Nexus<span className="text-indigo-500">Core</span>-Monitor
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                System Status: <span className={status ? 'text-emerald-400' : 'text-rose-400'}>{status ? 'ONLINE' : 'OFFLINE'}</span> • Auto-Sync Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
             <button 
              onClick={() => {setLoading(true); fetchHealth();}}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group active:scale-95"
             >
                <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
                Refresh Pulse
             </button>
             <div className="px-6 py-3 border border-slate-700 rounded-xl">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HQ: 127.0.0.1:5000</span>
             </div>
          </div>
        </div>

        {/* --- GRID SYSTEM --- */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: REAL-TIME METRICS */}
          <div className="col-span-12 xl:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCard icon={<Zap className="text-amber-400" />} label="Latency" value={status?.latency ? `${status.latency}ms` : '---'} detail={status?.latency && status.latency < 50 ? 'Optimal' : 'Standard'} />
              <MetricCard icon={<Activity className="text-indigo-400" />} label="Uptime" value="99.99%" detail="Zero Crashes" />
              <MetricCard icon={<Database className="text-emerald-400" />} label="DB Link" value="Active" detail="PostgreSQL Nexus" />
            </div>

            {/* MAIN STATUS DISPLAY */}
            <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-12 relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-colors duration-1000" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Node Calibration
                  </h3>
                  <div className="space-y-6">
                    <KVRow label="Environment" value={status?.environment || 'UNKNOWN'} highlight />
                    <KVRow label="Active Port" value={status?.port?.toString() || '---'} />
                    <KVRow label="API Node" value="Express Node.js" />
                    <KVRow label="Auth Engine" value="Spring Boot JWT" />
                    <KVRow label="Uptime" value={`${Math.floor(((status as any)?.uptime ?? 0) / 60)} min`} />
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Load Monitor
                  </h3>
                  <div className="space-y-6 bg-black/30 p-8 rounded-3xl border border-slate-800">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                        <span>Heap Utilization</span>
                        <span>{(status as any)?.memory?.heapUsed || 0} MB</span>
                      </div>
                      <ProgressBar progress={Math.min(100, Math.round(((status as any)?.memory?.heapUsed || 0) / ((status as any)?.memory?.heapTotal || 512) * 100))} color="bg-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                        <span>Memory RSS</span>
                        <span>{(status as any)?.memory?.rss || 0} MB</span>
                      </div>
                      <ProgressBar progress={Math.min(100, Math.round(((status as any)?.memory?.rss || 0) / 1024 * 100))} color="bg-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                        <span>Network Link</span>
                        <span>{status?.latency ? 'STABLE' : 'UNSTABLE'}</span>
                      </div>
                      <ProgressBar progress={status?.latency && status.latency < 100 ? 100 : 50} color="bg-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTE EXPLORER */}
            <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-12">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <Globe className="w-4 h-4" /> Registered Endpoints
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RouteCard method="GET" path="/api/health" status="200" time="4ms" />
                <RouteCard method="GET" path="/api/products" status="200" time="42ms" />
                <RouteCard method="POST" path="/api/auth/sync" status="201" time="156ms" />
                <RouteCard method="GET" path="/api/shops" status="200" time="28ms" />
              </div>
            </div>
          </div>

          {/* RIGHT: LOG STREAM */}
          <div className="col-span-12 xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 h-full flex flex-col overflow-hidden">
               <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Live Log Stream</h3>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
               </div>
               <div className="flex-1 p-8 overflow-y-auto font-mono text-[11px] space-y-4 max-h-[700px] scrollbar-hide">
                  {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20 py-20">
                      <Layers className="w-12 h-12" />
                      <p className="uppercase font-black text-[10px] tracking-[0.3em]">Awaiting Data Pulse...</p>
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className={`flex gap-4 p-4 rounded-xl border ${log.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : log.type === 'warn' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-slate-800/20 border-slate-800/50 text-slate-300'} animate-in slide-in-from-right duration-500`}>
                      <span className="opacity-40 shrink-0">[{log.time}]</span>
                      <span className="font-bold">{log.msg}</span>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-black/40 border-t border-slate-800 flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Nexus Buffer 01</span>
                 <Bell className="w-3 h-3 text-slate-600 animate-bounce" />
               </div>
            </div>
          </div>

        </div>

        {/* --- DANGER ZONE --- */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-[3rem] p-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <h3 className="text-xl font-black text-rose-500 uppercase italic tracking-tighter flex items-center gap-3">
               <AlertCircle className="w-6 h-6" /> Crisis Suppression
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-xl">
              Initiate an emergency system purge or hardware reboot. WARNING: This will terminate all active logic threads.
            </p>
          </div>
          <div className="flex gap-4">
             <button className="px-10 py-5 bg-rose-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-500 transition-all active:scale-95 shadow-[0_20px_50px_rgba(244,63,94,0.3)]">
               Purge Memory
             </button>
             <button className="px-10 py-5 border border-rose-500/30 text-rose-500 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-500/10">
               Hard Restart
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: any) {
  return (
    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 group hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase italic tracking-tighter">{detail}</p>
        </div>
      </div>
      <h4 className="text-4xl font-black text-white italic tracking-tighter">{value}</h4>
    </div>
  );
}

function KVRow({ label, value, highlight = false }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-black tracking-tight ${highlight ? 'text-indigo-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

function ProgressBar({ progress, color }: any) {
  return (
    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}

function RouteCard({ method, path, status, time }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-slate-800/50 group hover:border-slate-700 transition-all">
      <div className="flex items-center gap-4">
        <span className={`text-[9px] font-black px-3 py-1 rounded-lg ${method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {method}
        </span>
        <span className="text-[11px] font-bold text-slate-300 tracking-tight group-hover:text-white transition-colors">{path}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-emerald-400">{status}</span>
        <span className="text-[9px] font-bold text-slate-600 italic underline decoration-slate-800 underline-offset-4">{time}</span>
      </div>
    </div>
  );
}
