import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { CheckCircle2, Dumbbell, Loader2, Star } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { useCreateOrder } from '@/hooks/usePayments'
import { useMyProfile } from '@/hooks/useMembers'
import { useRazorpayCheckout } from '@/features/payments/RazorpayCheckout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import type { MembershipPlan } from '@/types'
import type { Payment, RazorpayOrder } from '@/api/payments'

export default function MemberPlansPage() {
  const [order, setOrder] = useState<RazorpayOrder | null>(null)
  const [successPayment, setSuccessPayment] = useState<Payment | null>(null)
  const [error, setError] = useState('')
  const openedOrder = useRef<string | null>(null)
  const { data: member } = useMyProfile()
  const { data: plans = [], isLoading } = usePlans({ gym: member?.gym })
  const createOrder = useCreateOrder()

  const { openCheckout, isVerifying } = useRazorpayCheckout({
    order,
    onSuccess: payment => {
      setSuccessPayment(payment)
      setOrder(null)
      openedOrder.current = null
    },
    onFailure: () => {
      setError('Payment could not be completed. Please try again.')
      setOrder(null)
      openedOrder.current = null
    },
    onDismiss: () => {
      setOrder(null)
      openedOrder.current = null
    },
  })

  useEffect(() => {
    if (order && openedOrder.current !== order.order_id) {
      openedOrder.current = order.order_id
      openCheckout()
    }
  }, [order, openCheckout])

  const buyPlan = async (plan: MembershipPlan) => {
    setError('')
    try {
      const response = await createOrder.mutateAsync(plan.id)
      setOrder(response.data.data)
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : null
      setError(message || 'We could not prepare this order. Please try again.')
    }
  }

  const activePlanId = member?.active_subscription?.plan.id
  const availablePlans = plans.filter(plan => plan.is_active)

  return (
    <div>
      <PageHeader title="Membership Plans" description={`Choose a plan available at ${member?.gym_name ?? 'your gym'}.`} />
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">{error}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : availablePlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <Dumbbell size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No plans available yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon or contact your gym.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map(plan => {
            const isCurrent = activePlanId === plan.id
            return (
              <div key={plan.id} className={`relative bg-card border rounded-2xl p-6 flex flex-col gap-5 transition-all hover:shadow-lg ${plan.is_featured ? 'border-primary ring-2 ring-primary/15' : 'border-border'}`}>
                {(plan.is_featured || isCurrent) && (
                  <span className={`absolute -top-3 left-5 flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white ${isCurrent ? 'bg-emerald-600' : 'bg-primary'}`}>
                    {isCurrent ? <CheckCircle2 size={11} /> : <Star size={11} fill="currentColor" />}
                    {isCurrent ? 'Current Plan' : 'Most Popular'}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black text-foreground">₹{Number(plan.price).toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground text-sm mb-1.5">/ {plan.duration_label}</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />{feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => buyPlan(plan)}
                  disabled={createOrder.isPending || isVerifying}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {isCurrent ? 'Renew Plan' : 'Get Started'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {(createOrder.isPending || isVerifying) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{isVerifying ? 'Verifying payment...' : 'Preparing your order...'}</p>
          </div>
        </div>
      )}

      <Modal open={!!successPayment} onClose={() => setSuccessPayment(null)} title="Payment complete" size="sm">
        <div className="text-center space-y-5 py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Membership activated</h3>
            <p className="text-sm text-muted-foreground mt-2">Your payment was verified and your QR card is ready.</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
            <p className="flex justify-between text-sm"><span className="text-muted-foreground">Invoice</span><span className="font-semibold">{successPayment?.invoice_number}</span></p>
            <p className="flex justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{successPayment?.plan_name}</span></p>
            <p className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-semibold">₹{Number(successPayment?.amount).toLocaleString('en-IN')}</span></p>
          </div>
          <button onClick={() => setSuccessPayment(null)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 cursor-pointer">Done</button>
        </div>
      </Modal>
    </div>
  )
}
