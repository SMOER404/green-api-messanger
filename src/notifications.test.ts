import { describe, expect, it } from 'vitest'
import { Notification } from './api'
import { parseNotification } from './notifications'

const notification = (over: Partial<Notification['body']> = {}): Notification => ({
  receiptId: 7,
  body: {
    typeWebhook: 'incomingMessageReceived',
    timestamp: 1763115112,
    idMessage: 'MSG1',
    senderData: { chatId: '10000000', senderName: 'Анна', senderPhoneNumber: 79876543210 },
    messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    ...over,
  },
})

describe('parseNotification', () => {
  it('входящее: чат определяется по senderPhoneNumber, запоминается alias и имя', () => {
    expect(parseNotification(notification(), {})).toEqual({
      chatId: '79876543210@c.us',
      rawChatId: '10000000',
      alias: { from: '10000000', to: '79876543210@c.us' },
      name: 'Анна',
      message: { id: 'MSG1', text: 'Привет', out: false, time: 1763115112000 },
    })
  })

  it('без номера использует ранее сохранённый alias', () => {
    const n = notification({ senderData: { chatId: '10000000' } })
    const parsed = parseNotification(n, { '10000000': '79876543210@c.us' })
    expect(parsed?.chatId).toBe('79876543210@c.us')
    expect(parsed?.alias).toBeUndefined()
  })

  it('без номера и alias оставляет числовой chatId', () => {
    const n = notification({ senderData: { chatId: '10000000' } })
    expect(parseNotification(n, {})?.chatId).toBe('10000000')
  })

  it('исходящее с телефона и через API помечается как out', () => {
    for (const typeWebhook of ['outgoingMessageReceived', 'outgoingAPIMessageReceived']) {
      const parsed = parseNotification(notification({ typeWebhook, senderData: { chatId: '79876543210@c.us' } }), {})
      expect(parsed?.message.out).toBe(true)
      expect(parsed?.name).toBeUndefined()
    }
  })

  it('поддерживает extendedTextMessage', () => {
    const n = notification({ messageData: { typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'ссылка' } } })
    expect(parseNotification(n, {})?.message.text).toBe('ссылка')
  })

  it('без idMessage берёт receiptId', () => {
    expect(parseNotification(notification({ idMessage: undefined }), {})?.message.id).toBe('7')
  })

  it('игнорирует служебные уведомления и не-текстовые сообщения', () => {
    expect(parseNotification(notification({ typeWebhook: 'stateInstanceChanged' }), {})).toBeNull()
    expect(parseNotification(notification({ messageData: { typeMessage: 'imageMessage' } }), {})).toBeNull()
  })
})
