import { Notification, phoneToChatId } from './api'
import { Message } from './types'

// chatId из уведомления (числовой) -> chatId чата, созданного по номеру ({номер}@c.us)
export type Aliases = Record<string, string>

export interface ParsedMessage {
  chatId: string
  /** chatId из самого уведомления (для Telegram/MAX — числовой) */
  rawChatId: string
  message: Message
  name?: string
  alias?: { from: string; to: string }
}

const OUTGOING = ['outgoingMessageReceived', 'outgoingAPIMessageReceived']

/** Превращает уведомление GREEN-API в сообщение чата; null — если это не текстовое сообщение. */
export function parseNotification(n: Notification, aliases: Aliases): ParsedMessage | null {
  const { body } = n
  const sd = body.senderData
  const md = body.messageData
  const text = md?.textMessageData?.textMessage ?? md?.extendedTextMessageData?.text
  const incoming = body.typeWebhook === 'incomingMessageReceived'
  const outgoing = OUTGOING.includes(body.typeWebhook)
  if (!(incoming || outgoing) || !sd?.chatId || !text) return null

  // В MAX/Telegram chatId числовой, а чат создан по номеру — связываем их через senderPhoneNumber.
  const phoneChat = incoming && sd.senderPhoneNumber ? phoneToChatId(String(sd.senderPhoneNumber)) : undefined
  return {
    chatId: phoneChat ?? aliases[sd.chatId] ?? sd.chatId,
    rawChatId: sd.chatId,
    alias: phoneChat ? { from: sd.chatId, to: phoneChat } : undefined,
    name: incoming ? sd.senderName : undefined,
    message: {
      id: body.idMessage ?? String(n.receiptId),
      text,
      out: outgoing,
      time: body.timestamp * 1000,
    },
  }
}
