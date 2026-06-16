import { Download, QrCode } from 'lucide-react'
import { useMyCard } from '@/hooks/usePayments'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

export default function MembershipCardPage() {
  const { data: card, isLoading, isError } = useMyCard()

  if (isLoading) {
    return <div><PageHeader title="Membership Card" /><div className="max-w-xl h-80 bg-muted rounded-3xl animate-pulse" /></div>
  }

  if (isError || !card) {
    return (
      <div>
        <PageHeader title="Membership Card" description="Your digital card appears after your first successful payment." />
        <div className="max-w-xl border border-dashed border-border rounded-2xl py-20 text-center">
          <QrCode size={42} className="mx-auto text-muted-foreground/30" />
          <p className="font-medium text-foreground mt-4">No membership card yet</p>
          <p className="text-sm text-muted-foreground mt-1">Purchase a membership plan to generate your QR card.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Membership Card" description="Present this QR code at reception when you check in." />
      <div className="max-w-xl">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-7 text-white shadow-xl shadow-primary/15">
          <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-20 w-56 h-56 rounded-full bg-black/10" />
          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/65">GymOS Member</p>
              <h2 className="text-2xl font-bold mt-2">{card.member_name}</h2>
              <p className="text-sm text-white/70 mt-1">{card.gym_name}</p>
              <Badge className="mt-4 bg-white/15 border-white/20 text-white">{card.plan_name ?? 'No active plan'}</Badge>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
              <img src={card.qr_code_url} alt={`QR code for ${card.member_name}`} className="w-32 h-32" />
            </div>
          </div>
          <div className="relative flex justify-between items-end mt-8 pt-5 border-t border-white/20">
            <div><p className="text-[10px] text-white/55 uppercase tracking-widest">Member ID</p><p className="text-sm font-mono font-bold mt-1">{card.member_code}</p></div>
            <div className="text-right"><p className="text-[10px] text-white/55 uppercase tracking-widest">Status</p><p className="text-sm font-semibold mt-1">Active</p></div>
          </div>
        </div>

        <a href={card.qr_code_url} download={`${card.member_code}-membership-qr.png`} className="mt-4 flex items-center justify-center gap-2 border border-border bg-card text-foreground text-sm font-semibold py-3 rounded-xl hover:bg-muted transition-colors">
          <Download size={16} /> Download QR Code
        </a>
        <p className="text-xs text-center text-muted-foreground mt-4">Generated {new Date(card.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  )
}
