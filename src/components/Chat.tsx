import { useState } from 'react'
import { Credentials, sendMessage } from '../api'
import { useChats } from '../hooks/useChats'
import { useNotifications } from '../hooks/useNotifications'
import { useNotificationSettings } from '../hooks/useNotificationSettings'
import ChatList from './ChatList'
import Conversation from './Conversation'

export default function Chat({ creds, onLogout }: { creds: Credentials; onLogout: () => void }) {
  const { chats, aliases, addMessage, addParsed, createChat, titleOf } = useChats(creds.idInstance)
  const settings = useNotificationSettings(creds)
  const [active, setActive] = useState<string | null>(null)
  const [error, setError] = useState('')

  useNotifications(creds, aliases, addParsed)

  const send = async (text: string) => {
    if (!active) return false
    setError('')
    try {
      const { idMessage } = await sendMessage(creds, active, text)
      addMessage(active, { id: idMessage, text, out: true, time: Date.now() })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки')
      return false
    }
  }

  return (
    <div className="app">
      {settings.state !== 'ok' && (
        <div className="banner">
          {settings.state === 'off' ? (
            <>
              Приём сообщений выключен в настройках инстанса (нужны incomingWebhook=yes и пустой webhookUrl).{' '}
              <button className="link" onClick={settings.enable}>Включить</button>
              {settings.error && <span className="error"> {settings.error}</span>}
            </>
          ) : (
            'Настройки сохранены, инстанс перезапустится и применит их в течение ~5 минут. Затем сообщения начнут приходить.'
          )}
        </div>
      )}
      <div className="panes">
        <ChatList
          chats={chats}
          active={active}
          titleOf={titleOf}
          onSelect={setActive}
          onCreate={(phone) => {
            const id = createChat(phone)
            if (id) setActive(id)
          }}
          onLogout={onLogout}
        />
        <Conversation
          chatId={active}
          title={active ? titleOf(active) : ''}
          messages={active ? chats[active] ?? [] : []}
          error={error}
          onSend={send}
        />
      </div>
    </div>
  )
}
