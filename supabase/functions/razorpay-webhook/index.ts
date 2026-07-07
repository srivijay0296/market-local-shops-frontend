// Supabase Edge Function: Razorpay Webhook Handler
// Deploy: supabase functions deploy razorpay-webhook
// Set secrets: supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxx SUPABASE_SERVICE_ROLE_KEY=xxx

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Read raw body (needed for signature verification) ─────────────────
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // ── 2. Verify HMAC-SHA256 signature ──────────────────────────────────────
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not set");
      return new Response("Server misconfiguration", { status: 500 });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(rawBody)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== signature) {
      console.warn("Signature mismatch — possible spoofed request");
      return new Response("Invalid signature", { status: 401 });
    }

    // ── 3. Parse event payload ─────────────────────────────────────────────
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log("Razorpay event:", eventType);

    // ── 4. Initialize Supabase with service role key (bypasses RLS) ────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── 5. Handle payment.captured event ──────────────────────────────────
    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes ?? {};
      const userId: string = notes.user_id;
      const plan: string = notes.plan ?? "monthly"; // 'monthly' | 'yearly'

      if (!userId) {
        console.error("No user_id in payment notes — cannot link to subscription");
        return new Response("Missing user_id in notes", { status: 400 });
      }

      const startDate = new Date();
      const endDate = new Date();
      if (plan === "yearly") {
        endDate.setDate(startDate.getDate() + 365);
      } else {
        endDate.setDate(startDate.getDate() + 30);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "ACTIVE",
          payment_status: "PAID",
          subscription_plan: plan.toUpperCase(),
          payment_date: startDate.toISOString(),
          expiry_date: endDate.toISOString(),
          subscription_expires_at: endDate.toISOString(),
          last_payment_id: payment.id || "pay_webhook"
        })
        .eq("id", userId);

      if (error) {
        console.error("Failed to update subscription:", error);
        return new Response("DB error", { status: 500 });
      }

      console.log(`Subscription activated for user ${userId} — plan: ${plan}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 6. Handle payment.failed event ────────────────────────────────────
    if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      console.warn("Payment failed for order:", payment.order_id);
      // Optionally: log to a payment_events table
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 7. Unknown event — acknowledge but do nothing ─────────────────────
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
