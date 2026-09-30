import { FormEvent, useEffect, useRef, useState } from 'react'
import { avatarGradient, avatarLabel } from '../avatar'
import { Message } from '../types'

const MAX_LENGTH = 4096

interface Props {
  chatId: string | null
  title: string
  messages: Message[]
  error: string
  onSend: (text: string) => Promise<boolean>
}

export default function Conversation({ chatId, title, messages, error, onSend }: Props) {
  const [text, setText] = useState('')
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, chatId])

  if (!chatId) {
    return (
      <main>
        <div className="empty">Введите номер телефона и создайте чат</div>
      </main>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    if (!(await onSend(body))) setText(body)
  }

  return (
    <main>
      <header>
        <div className="avatar sm" style={{ background: avatarGradient(chatId) }}>{avatarLabel(chatId)}</div>
        <b>{title}</b>
      </header>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.out ? 'out' : 'in'}`}>
            {m.text}
            <time>{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {error && <div className="error">{error}</div>}
      <form className="composer" onSubmit={submit}>
        <input placeholder="Сообщение" maxLength={MAX_LENGTH} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        <button className="send" aria-label="Отправить" disabled={!text.trim()}>
          <svg viewBox="0 0 24 24"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" /></svg>
        </button>
      </form>
    </main>
  )
}
