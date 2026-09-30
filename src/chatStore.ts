import { ParsedMessage } from './notifications'
import { Chats, Message } from './types'

/**
 * В какой чат класть сообщение. Эхо сообщения, отправленного через API, приходит с числовым chatId
 * получателя, который мы ещё не знаем — но idMessage уже есть в чате, из которого мы отправляли.
 */
export function resolveTarget(chats: Chats, { chatId, message }: ParsedMessage): string {
  return Object.keys(chats).find((id) => chats[id].some((m) => m.id === message.id)) ?? chatId
}

/** Переносит сообщения чата `from` в `to` (без дублей, по времени) и удаляет `from`. */
export function mergeChats(chats: Chats, from: string, to: string): Chats {
  if (from === to || !chats[from]) return chats
  const { [from]: orphan, ...rest } = chats
  const merged = [...(rest[to] ?? [])]
  for (const m of orphan) if (!merged.some((x) => x.id === m.id)) merged.push(m)
  return { ...rest, [to]: merged.sort((a, b) => a.time - b.time) }
}

export function appendMessage(chats: Chats, chatId: string, m: Message): Chats {
  const list = chats[chatId] ?? []
  if (list.some((x) => x.id === m.id)) return chats
  return { ...chats, [chatId]: [...list, m] }
}
