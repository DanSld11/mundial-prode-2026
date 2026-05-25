'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { getAccessToken, createAuthedClient } from '@/lib/auth-client'
import { Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessageAction } from '../actions'

interface Message {
  id: string
  pool_id: string
  user_id: string
  message: string
  created_at: string
  profile?: { username: string }
}

interface Props {
  poolId: string
  myUserId: string
}

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (Math.floor(diffMins / 60) < 24) return `${Math.floor(diffMins / 60)}h`
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export function PoolChat({ poolId, myUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const token = useMemo(() => getAccessToken(), [])
  const supabase = useMemo(() => token ? createAuthedClient(token) : null, [token])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase
      .from('pool_messages')
      .select('*, profile:profiles(username)')
      .eq('pool_id', poolId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as any) ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`chat:${poolId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pool_messages', filter: `pool_id=eq.${poolId}` },
        async (payload) => {
          const newMsg = payload.new as Message
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newMsg.user_id)
            .single()
          setMessages((prev) => {
            // Evitar duplicados (ej: por actualización optimista)
            if (prev.some(m => m.id === newMsg.id || (m.user_id === newMsg.user_id && m.message === newMsg.message && m.id.startsWith('temp-')))) {
              // Reemplazar el mensaje temporal por el real
              return prev.map(m => (m.user_id === newMsg.user_id && m.message === newMsg.message && m.id.startsWith('temp-')) ? { ...newMsg, profile: profile ?? undefined } : m)
            }
            return [...prev, { ...newMsg, profile: profile ?? undefined }]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, poolId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')

    // Actualización optimista: lo mostramos de inmediato en el chat
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      pool_id: poolId,
      user_id: myUserId,
      message: trimmed,
      created_at: new Date().toISOString(),
      profile: { username: 'Tú' } // Se mostrará a la derecha igual
    }
    setMessages(prev => [...prev, tempMsg])

    await sendMessageAction(poolId, trimmed)
    setSending(false)
  }

  if (!token || !myUserId) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Iniciá sesión para acceder al chat.
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-card overflow-hidden" style={{ height: 420 }}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageCircle className="h-4 w-4 text-brand-red" />
        <span className="text-sm font-semibold">Chat de la polla</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Aún no hay mensajes.</p>
              <p className="text-xs text-muted-foreground">¡Sé el primero en escribir!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === myUserId
            const initial = msg.profile?.username?.charAt(0).toUpperCase() ?? '?'
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {initial}
                  </div>
                )}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <span className="text-[11px] font-semibold text-muted-foreground px-1">
                      {msg.profile?.username ?? '—'}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-brand-red text-white rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="px-1 text-[10px] text-muted-foreground">{timeLabel(msg.created_at)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          className="flex-1 text-sm"
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-brand-red hover:bg-red-700 shrink-0"
          disabled={!text.trim() || sending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
