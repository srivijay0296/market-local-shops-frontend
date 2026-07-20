import React from "react";
import { Radio } from "lucide-react";

interface BroadcastTabProps {
  notifTitle: string;
  setNotifTitle: (val: string) => void;
  notifBody: string;
  setNotifBody: (val: string) => void;
  notifTarget: string;
  setNotifTarget: (val: string) => void;
  handleSendNotification: (e: React.FormEvent) => void;
}

export const BroadcastTab = React.memo(function BroadcastTab({
  notifTitle,
  setNotifTitle,
  notifBody,
  setNotifBody,
  notifTarget,
  setNotifTarget,
  handleSendNotification
}: BroadcastTabProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">Broadcast Announcements</h3>
        <p className="text-slate-500 text-xs mt-0.5">Send custom alert notices to client users.</p>
      </div>

      <form onSubmit={handleSendNotification} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Target Audience</label>
          <select
            value={notifTarget}
            onChange={e => setNotifTarget(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
          >
            <option value="ALL">All App Users</option>
            <option value="SELLERS">Shop Owners Only</option>
            <option value="CUSTOMERS">Customers Only</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Notice Title</label>
          <input
            required
            type="text"
            value={notifTitle}
            onChange={e => setNotifTitle(e.target.value)}
            placeholder="Weekly Server Optimization Notification"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Message Content</label>
          <textarea
            required
            rows={4}
            value={notifBody}
            onChange={e => setNotifBody(e.target.value)}
            placeholder="The server schema sync completes shortly. You might experience 1-2 minutes latency..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button type="submit" className="btn-primary py-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Radio className="w-4 h-4 animate-pulse" /> Dispatch Announcement
        </button>
      </form>
    </div>
  );
});
