import { useState } from 'react'
import { ChevronRight, MessageSquare, Plus, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTicket, useReplyTicket, useTicket, useTickets } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const statusVariant = { open: 'warning', in_progress: 'default', closed: 'outline' } as const
const priorityVariant = { low: 'outline', medium: 'warning', high: 'destructive' } as const
const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  message: z.string().min(10, 'Please describe your issue (min 10 chars)'),
  priority: z.enum(['low', 'medium', 'high']),
})
type FormData = z.infer<typeof schema>
const inputClass = 'w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

function TicketThread({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState('')
  const { data: ticket, isLoading } = useTicket(ticketId)
  const replyMutation = useReplyTicket(ticketId)
  const sendReply = () => {
    const body = reply.trim()
    if (body) replyMutation.mutate(body, { onSuccess: () => setReply('') })
  }
  if (isLoading || !ticket) return <div className="h-64 bg-muted rounded-xl animate-pulse" />
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority} priority</Badge></div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {ticket.messages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No messages yet.</p> : ticket.messages.map((message) => {
          const isAdmin = message.sender_role !== 'member'
          return <div key={message.id} className={cn('flex', isAdmin ? 'justify-start' : 'justify-end')}><div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm', isAdmin ? 'bg-muted text-foreground rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm')}><p className="text-xs font-semibold mb-1 opacity-70">{message.sender_name}</p><p>{message.body}</p><p className="text-xs mt-1.5 opacity-60">{new Date(message.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>
        })}
      </div>
      {ticket.status !== 'closed' && <div className="flex gap-2 pt-2 border-t border-border"><input value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendReply() } }} placeholder="Type a reply..." className={cn(inputClass, 'flex-1')} /><button onClick={sendReply} disabled={replyMutation.isPending || !reply.trim()} className="p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-60"><Send size={16} /></button></div>}
    </div>
  )
}

export default function MemberTicketsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data: tickets = [], isLoading } = useTickets()
  const createTicket = useCreateTicket()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { priority: 'medium' } })
  const onSubmit = (data: FormData) => createTicket.mutate(data, { onSuccess: () => { reset(); setCreateOpen(false) } })
  return (
    <div>
      <PageHeader title="Support" description="Get help from gym staff." actions={<button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl"><Plus size={16} /> New Ticket</button>} />
      {isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
        : tickets.length === 0 ? <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl"><MessageSquare size={40} className="text-muted-foreground/30 mb-4" /><p className="font-medium">No tickets yet</p><p className="text-sm text-muted-foreground mt-1">Raise a ticket if you need help.</p></div>
          : <div className="space-y-3">{tickets.map((ticket) => <button key={ticket.id} onClick={() => setActiveId(ticket.id)} className="w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 text-left"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><MessageSquare size={18} className="text-primary" /></div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{ticket.title}</p><div className="flex items-center gap-2 mt-1"><Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge><span className="text-xs text-muted-foreground">{ticket.message_count} messages</span></div></div><ChevronRight size={16} className="text-muted-foreground" /></button>)}</div>}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Support Ticket"><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div><label className="text-sm font-medium">Subject</label><input {...register('title')} className={cn(inputClass, errors.title && 'border-destructive')} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div><div><label className="text-sm font-medium">Priority</label><select {...register('priority')} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><div><label className="text-sm font-medium">Message</label><textarea {...register('message')} rows={4} className={cn(inputClass, 'resize-none', errors.message && 'border-destructive')} />{errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}</div><div className="flex justify-end"><button disabled={createTicket.isPending} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">{createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}</button></div></form></Modal>
      <Modal open={Boolean(activeId)} onClose={() => setActiveId(null)} title={tickets.find((ticket) => ticket.id === activeId)?.title ?? 'Ticket'}>{activeId && <TicketThread ticketId={activeId} />}</Modal>
    </div>
  )
}
