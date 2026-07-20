import React from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface SettingsTabProps {
  sysSettings: {
    maintenanceMode: boolean;
    googleMapsEnabled: boolean;
    stripeSandbox: boolean;
    dailyBackup: boolean;
    serverPort: string;
    jwtTTL: string;
  };
  setSysSettings: (val: any) => void;
}

export const SettingsTab = React.memo(function SettingsTab({
  sysSettings,
  setSysSettings
}: SettingsTabProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">System Administration</h3>
        <p className="text-slate-500 text-xs mt-0.5">Toggle global variable configurations and active payment gates.</p>
      </div>

      <div className="bg-white border border-slate-200 p-6 lg:p-8 rounded-3xl space-y-6">
        
        <div className="space-y-4 divide-y divide-slate-100">
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm font-bold text-slate-800">Maintenance Mode</p>
              <p className="text-xs text-slate-400">Put platform into offline status for customers.</p>
            </div>
            <button onClick={() => setSysSettings({ ...sysSettings, maintenanceMode: !sysSettings.maintenanceMode })}>
              {sysSettings.maintenanceMode ? <ToggleRight className="w-10 h-10 text-red-500" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Google Maps Autocomplete</p>
              <p className="text-xs text-slate-400">Allow maps API location validation during seller signups.</p>
            </div>
            <button onClick={() => setSysSettings({ ...sysSettings, googleMapsEnabled: !sysSettings.googleMapsEnabled })}>
              {sysSettings.googleMapsEnabled ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Stripe Integration Sandbox</p>
              <p className="text-xs text-slate-400">Allow orders checking with mock checkout credentials.</p>
            </div>
            <button onClick={() => setSysSettings({ ...sysSettings, stripeSandbox: !sysSettings.stripeSandbox })}>
              {sysSettings.stripeSandbox ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Automatic Database Backups</p>
              <p className="text-xs text-slate-400">Perform nightly database schema snapshots automatically.</p>
            </div>
            <button onClick={() => setSysSettings({ ...sysSettings, dailyBackup: !sysSettings.dailyBackup })}>
              {sysSettings.dailyBackup ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button onClick={() => toast.success("Configuration modifications saved successfully.")} className="btn-primary py-2.5 px-6 font-bold text-xs uppercase tracking-wider">Save Changes</button>
        </div>
      </div>
    </div>
  );
});
