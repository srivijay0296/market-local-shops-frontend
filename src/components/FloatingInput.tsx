/**
 * FloatingInput.tsx
 * Reusable animated floating-label input field.
 * Used across EmailLogin, PhoneLogin, Signup.
 */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FloatingInputProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showToggle?: boolean;   // show eye icon for password
  toggled?: boolean;      // is password visible?
  onToggle?: () => void;
  suffix?: React.ReactNode;
  autoComplete?: string;
}

export default function FloatingInput({
  id, label, icon: Icon, value, onChange,
  type = "text", placeholder, required, disabled,
  showToggle, toggled, onToggle, suffix, autoComplete,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  const inputType = showToggle ? (toggled ? "text" : "password") : type;

  return (
    <div className="relative group">
      {/* Focus glow */}
      {focused && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[0_0_20px_rgba(99,102,241,0.12)]" />
      )}

      <div className={[
        "relative flex items-center rounded-2xl border transition-all duration-300 overflow-hidden",
        focused
          ? "bg-indigo-500/5 border-indigo-500"
          : "bg-white/5 border-white/10 hover:border-white/20",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}>
        {/* Icon */}
        <div className={`absolute left-4 transition-colors duration-200 pointer-events-none ${active ? "text-indigo-400" : "text-slate-500"}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Label + Input stack */}
        <div className="relative flex-1 pt-5 pb-2 pl-11 pr-4">
          <label
            htmlFor={id}
            className={[
              "absolute left-11 transition-all duration-200 pointer-events-none font-bold",
              active
                ? "top-1.5 text-[9px] text-indigo-400 tracking-widest uppercase"
                : "top-1/2 -translate-y-1/2 text-sm text-slate-400",
            ].join(" ")}
          >
            {label}
          </label>
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={active ? placeholder : ""}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className="w-full bg-transparent text-white text-sm font-semibold outline-none placeholder:text-slate-600 mt-0.5 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password toggle */}
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="pr-4 text-slate-500 hover:text-slate-300 transition"
            aria-label={toggled ? "Hide password" : "Show password"}
          >
            {toggled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Arbitrary suffix */}
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
    </div>
  );
}
