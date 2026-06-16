import { useVerifyPayment } from '@/hooks/usePayments'
import type { Payment, RazorpayOrder } from '@/api/payments'

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayInstance { open: () => void }
interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance
}

declare global {
  interface Window { Razorpay?: RazorpayConstructor }
}

interface Props {
  order: RazorpayOrder | null
  onSuccess: (payment: Payment) => void
  onFailure: () => void
  onDismiss: () => void
}

export function useRazorpayCheckout({ order, onSuccess, onFailure, onDismiss }: Props) {
  const verify = useVerifyPayment()

  const openCheckout = () => {
    if (!order) return
    if (!window.Razorpay) {
      onFailure()
      return
    }

    const checkout = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'GymOS',
      description: order.plan_name,
      prefill: {
        name: order.member_name,
        email: order.member_email,
        contact: order.member_phone,
      },
      theme: { color: '#4f46e5' },
      handler: async (response: RazorpayResponse) => {
        try {
          const result = await verify.mutateAsync(response)
          onSuccess(result.data.data)
        } catch {
          onFailure()
        }
      },
      modal: { ondismiss: onDismiss },
    })
    checkout.open()
  }

  return { openCheckout, isVerifying: verify.isPending }
}
