import { useState } from 'react'
import { ChevronRight, MessageSquare, Send } from 'lucide-react'
import { useReplyTicket, useTicket, useTickets, useUpdateTicketStatus } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const statusVariant = { open: 'warning', in_progress: 'default', closed: 'outline' } as const
const priorityVariant = { low: 'outline', medium: 'warning', high: 'destructive' } as const

function AdminTicketThread({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState('')
  const { data: ticket, isLoading } = useTicket(ticketId)
  const replyMutation = useReplyTicket(ticketId)
  const statusMutation = useUpdateTicketStatus(ticketId)
  const sendReply = () => {
    const body = reply.trim()
    if (body) replyMutation.mutate(body, { onSuccess: () => setReply('') })
  }
  if (isLoading || !ticket) return <div className="h-48 bg-muted rounded-xl animate-pulse" />
  return <div className="space-y-4"><div className="flex items-center gap-2 flex-wrap"><Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority} priority</Badge><span className="text-xs text-muted-foreground">by {ticket.created_by_name}</span><div className="ml-auto flex gap-2">{(['open', 'in_progress', 'closed'] as const).map((status) => <button key={status} onClick={() => statusMutation.mutate(status)} disabled={ticket.status === status || statusMutation.isPending} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border disabled:opacity-40', ticket.status === status ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted')}>{status.replace('_', ' ')}</button>)}</div></div><div className="space-y-3 max-h-72 overflow-y-auto pr-1">{ticket.messages.map((message) => { const isAdmin = message.sender_role !== 'member'; return <div key={message.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm', isAdmin ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm')}><p className="text-xs font-semibold mb-1 opacity-70">{message.sender_name}</p><p>{message.body}</p><p className="text-xs mt-1.5 opacity-60">{new Date(message.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div></div> })}</div>{ticket.status !== 'closed' && <div className="flex gap-2 pt-2 border-t border-border"><input value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendReply() } }} placeholder="Reply to member..." className="flex-1 border border-input rounded-lg px-3 py-2.5 text-sm bg-background" /><button onClick={sendReply} disabled={replyMutation.isPending || !reply.trim()} className="p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-60"><Send size={16} /></button></div>}</div>
}

export default function TicketsPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data: tickets = [], isLoading } = useTickets()
  return <div><PageHeader title="Support Tickets" description="Respond to member queries." />{isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div> : tickets.length === 0 ? <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl"><MessageSquare size={40} className="text-muted-foreground/30 mb-4" /><p className="font-medium">No tickets</p><p className="text-sm text-muted-foreground mt-1">Member queries will appear here.</p></div> : <div className="space-y-3">{tickets.map((ticket) => <button key={ticket.id} onClick={() => setActiveId(ticket.id)} className="w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 text-left"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><MessageSquare size={18} className="text-primary" /></div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{ticket.title}</p><div className="flex items-center gap-2 mt-1"><Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge><span className="text-xs text-muted-foreground">from {ticket.created_by_name}</span></div></div><ChevronRight size={16} className="text-muted-foreground" /></button>)}</div>}<Modal open={Boolean(activeId)} onClose={() => setActiveId(null)} title={tickets.find((ticket) => ticket.id === activeId)?.title ?? 'Ticket'}>{activeId && <AdminTicketThread ticketId={activeId} />}</Modal></div>
}
