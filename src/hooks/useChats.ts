import { useCallback, useRef } from 'react'
import { chatIdToPhone, phoneToChatId } from '../api'
import { Aliases, ParsedMessage } from '../notifications'
import { appendMessage, mergeChats, resolveTarget } from '../chatStore'
import { Chats, Message } from '../types'
import { useLocalStorage } from './useLocalStorage'

export function useChats(idInstance: string) {
  const prefix = `max-chat:${idInstance}`
  const [chats, setChats] = useLocalStorage<Chats>(`${prefix}:chats`, {})
  const [names, setNames] = useLocalStorage<Record<string, string>>(`${prefix}:names`, {})
  const [aliases, setAliases] = useLocalStorage<Aliases>(`${prefix}:aliases`, {})

  const chatsRef = useRef(chats)
  chatsRef.current = chats

  const addMessage = useCallback(
    (chatId: string, m: Message) => setChats((prev) => appendMessage(prev, chatId, m)),
    [setChats],
  )

  const addParsed = useCallback(
    (parsed: ParsedMessage) => {
      const target = resolveTarget(chatsRef.current, parsed)
      const from = parsed.rawChatId
      // Числовой chatId и чат по номеру — один и тот же человек: запоминаем и склеиваем дубль.
      if (from !== target && target.endsWith('@c.us')) {
        setAliases((p) => (p[from] === target ? p : { ...p, [from]: target }))
      }
      if (parsed.name) setNames((p) => (p[target] === parsed.name ? p : { ...p, [target]: parsed.name! }))
      setChats((prev) => appendMessage(mergeChats(prev, from, target), target, parsed.message))
    },
    [setAliases, setNames, setChats],
  )

  /** Создаёт пустой чат по номеру телефона и возвращает его chatId (null — номер некорректен). */
  const createChat = useCallback(
    (phone: string) => {
      if (phone.replace(/\D/g, '').length < 7) return null
      const id = phoneToChatId(phone)
      setChats((p) => (p[id] ? p : { ...p, [id]: [] }))
      return id
    },
    [setChats],
  )

  const titleOf = (id: string) => names[id] ?? (id.endsWith('@c.us') ? `+${chatIdToPhone(id)}` : `ID ${id}`)

  return { chats, aliases, addMessage, addParsed, createChat, titleOf }
}
