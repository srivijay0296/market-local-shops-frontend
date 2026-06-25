import { backendApi } from './api';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * 💳 Nexus Payment Protocol
 * Orchestrates checkout with Razorpay and validates with the backend
 */
export const initiatePayment = async (amount: number, metadata: any = {}) => {
  try {
    // 1. Create order on backend
    const response = await backendApi.post('/payment/order', { 
      amount, 
      receipt: `order_rcpt_${Date.now()}` 
    });

    const order = response.data;

    if (!order || !order.id) {
        throw new Error('Payment gateway synchronization failed');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Namma Market',
        description: 'Quality Textiles Purchase',
        image: '/icon.png',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 2. Verify payment on backend
            const verification = await backendApi.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const result = verification.data;
            if (result.status === 'verified') {
              toast.success('Payment Verified. Order Processing Segment Active.');
              resolve(result);
            } else {
              toast.error('Payment Verification Failed');
              reject(new Error('Signature verification mismatch'));
            }
          } catch (err) {
            toast.error('Post-Payment Trace Collision');
            reject(err);
          }
        },
        prefill: metadata.prefill || {},
        theme: {
          color: '#2a4f5f',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error('Payment Interrupted: ' + response.error.description);
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  } catch (err: any) {
    console.error('💳 Payment Transmission Fault:', err);
    toast.error('Payment Engine Offline: ' + err.message);
    throw err;
  }
};
