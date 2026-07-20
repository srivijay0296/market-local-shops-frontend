import React, { InputHTMLAttributes, forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  helperText?: string;
  focusColor?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  icon: Icon,
  iconColor = "text-slate-500",
  helperText,
  focusColor = "blue",
  ...props
}, ref) => {
  
  // Tailwind dynamic classes check for focus
  const focusRing = {
    blue: "focus:ring-blue-500/10 focus:border-blue-500",
    emerald: "focus:ring-emerald-500/10 focus:border-emerald-500",
    rose: "focus:ring-rose-500/10 focus:border-rose-500",
    amber: "focus:ring-amber-500/10 focus:border-amber-500",
    purple: "focus:ring-purple-500/10 focus:border-purple-500",
  }[focusColor] || "focus:ring-blue-500/10 focus:border-blue-500";

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        {label}
      </label>
      <input
        ref={ref}
        {...props}
        className={`w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 ${focusRing} outline-none transition-all text-slate-800 font-medium font-sans placeholder:text-slate-400`}
      />
      {helperText && (
        <p className={`text-xs font-bold ml-2 ${props.disabled ? 'text-slate-300' : 'text-slate-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";
