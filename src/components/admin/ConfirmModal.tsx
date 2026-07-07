import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  title = "Are you sure?", 
  message = "This action cannot be undone. This will permanently delete the selected item from the database.", 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-red-500 p-6 flex flex-col items-center justify-center relative">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition rounded-full hover:bg-white/20 p-2"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-white text-center tracking-tight">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-8 text-center bg-slate-50">
          <p className="text-slate-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-8 pb-8 pt-4 bg-slate-50 flex gap-3 flex-col sm:flex-row">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-xl hover:shadow-red-600/40 transition active:scale-[0.98]"
          >
            Yes, Delete it!
          </button>
        </div>
      </div>
      
    </div>
  );
}