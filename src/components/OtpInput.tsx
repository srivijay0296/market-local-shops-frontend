/**
 * OtpInput.tsx
 * 6-box OTP component with:
 *  - Auto-focus next box on digit entry
 *  - Backspace → focus previous box
 *  - Full paste support (pastes all 6 digits at once)
 */
import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({ value, onChange, disabled, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  // Auto-focus first box on mount if requested
  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1); // last numeric char only
    const next = [...digits];
    next[i] = digit;
    onChange(next.join(""));
    // Move focus forward
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        // Clear current box
        const next = [...digits];
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        // Move back and clear previous
        refs.current[i - 1]?.focus();
        const next = [...digits];
        next[i - 1] = "";
        onChange(next.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    onChange(next.join(""));
    // Focus last filled or last box
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center" role="group" aria-label="One-time password input">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target}
          aria-label={`OTP digit ${i + 1}`}
          className={[
            "w-12 h-14 text-center text-xl font-black rounded-2xl border-2 outline-none",
            "transition-all duration-200 bg-white/5 text-white caret-indigo-400",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            d
              ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20"
              : "border-white/10 hover:border-white/20 focus:border-indigo-400 focus:bg-indigo-500/5",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
