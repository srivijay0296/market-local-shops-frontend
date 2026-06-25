// Razorpay SDK integration for Bargur Market
// Uses real Razorpay checkout.js SDK when available, falls back to dummy in dev

export interface RazorpayOptions {
  key: string;
  amount: number;        // in paise (₹1 = 100)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  notes?: Record<string, string>;  // Pass user_id + plan here → read by webhook
  handler: (response: any) => void;
  onFailure?: (error: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

// ── Load Razorpay checkout.js dynamically ────────────────────────────────────
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay SDK — using dummy fallback");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// ── Open real Razorpay checkout, fall back to dummy if SDK unavailable ────────
export const initiatePayment = async (options: RazorpayOptions): Promise<void> => {
  const loaded = await loadRazorpay();

  if (loaded && (window as any).Razorpay) {
    // ✅ Real Razorpay checkout
    const rzp = new (window as any).Razorpay({
      ...options,
      key: options.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
    rzp.on("payment.failed", (response: any) => {
      console.error("Payment failed:", response.error);
      if (options.onFailure) {
        options.onFailure(response.error);
      }
    });
    rzp.open();
  } else {
    // 🔶 Dummy fallback for local dev (no live key needed)
    initiateDummyPayment(options);
  }
};

// ── Keep dummy payment for dev/testing ───────────────────────────────────────
export const initiateDummyPayment = (options: RazorpayOptions): void => {
  console.log("[DEV] Razorpay dummy payment initiated:", {
    amount: `₹${options.amount / 100}`,
    description: options.description,
    notes: options.notes,
  });
  // Simulate 2-second payment processing
  setTimeout(() => {
    const dummyResponse = {
      razorpay_payment_id: `pay_dev_${Math.random().toString(36).substring(7)}`,
      razorpay_order_id:   options.order_id ?? `order_dev_${Math.random().toString(36).substring(7)}`,
      razorpay_signature:  `sig_dev_${Math.random().toString(36).substring(7)}`,
    };
    console.log("[DEV] Dummy payment success:", dummyResponse);
    options.handler(dummyResponse);
  }, 2000);
};
