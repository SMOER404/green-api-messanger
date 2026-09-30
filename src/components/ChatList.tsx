import { FormEvent, useState } from 'react'
import { avatarGradient, avatarLabel } from '../avatar'
import { Chats } from '../types'

interface Props {
  chats: Chats
  active: string | null
  titleOf: (id: string) => string
  onSelect: (id: string) => void
  onCreate: (phone: string) => void
  onLogout: () => void
}

export default function ChatList({ chats, active, titleOf, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onCreate(phone)
    setPhone('')
  }

  return (
    <aside>
      <header>
        <span>Чаты</span>
        <button className="link" onClick={onLogout}>Выйти</button>
      </header>
      <form className="new" onSubmit={submit}>
        <input placeholder="Номер телефона, 79001234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button aria-label="Создать чат">+</button>
      </form>
      <ul>
        {Object.entries(chats).map(([id, list]) => (
          <li key={id} className={id === active ? 'active' : ''} onClick={() => onSelect(id)}>
            <div className="avatar" style={{ background: avatarGradient(id) }}>{avatarLabel(id)}</div>
            <div className="meta">
              <b>{titleOf(id)}</b>
              <span>{list[list.length - 1]?.text ?? 'Нет сообщений'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
