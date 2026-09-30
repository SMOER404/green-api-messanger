import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Credentials,
  chatIdToPhone,
  deleteNotification,
  notificationsReady,
  phoneToChatId,
  receiveNotification,
  sendMessage,
} from './api'

const creds: Credentials = { idInstance: '1101', apiTokenInstance: 'tok', apiUrl: 'https://api.green-api.com/' }

function mockFetch(body: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    text: async () => (body === null ? '' : JSON.stringify(body)),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('chatId', () => {
  it('преобразует телефон в chatId, отбрасывая лишние символы', () => {
    expect(phoneToChatId('+7 (900) 123-45-67')).toBe('79001234567@c.us')
  })
  it('достаёт номер из chatId', () => {
    expect(chatIdToPhone('79001234567@c.us')).toBe('79001234567')
  })
})

describe('GREEN-API запросы', () => {
  it('sendMessage: POST на /waInstance{id}/sendMessage/{token} c chatId и message', async () => {
    const fetch = mockFetch({ idMessage: 'abc' })
    const res = await sendMessage(creds, '79001234567@c.us', 'привет')
    expect(res.idMessage).toBe('abc')
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://api.green-api.com/waInstance1101/sendMessage/tok')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ chatId: '79001234567@c.us', message: 'привет' })
  })

  it('receiveNotification: GET с receiveTimeout, пустая очередь даёт null', async () => {
    const fetch = mockFetch(null)
    expect(await receiveNotification(creds)).toBeNull()
    expect(fetch.mock.calls[0][0]).toBe('https://api.green-api.com/waInstance1101/receiveNotification/tok?receiveTimeout=5')
  })

  it('deleteNotification: DELETE с receiptId в пути', async () => {
    const fetch = mockFetch({ result: true })
    await deleteNotification(creds, 42)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://api.green-api.com/waInstance1101/deleteNotification/tok/42')
    expect(init.method).toBe('DELETE')
  })

  it('бросает ошибку при не-2xx ответе', async () => {
    mockFetch({}, false, 401)
    await expect(sendMessage(creds, 'x', 'y')).rejects.toThrow('401')
  })
})

describe('notificationsReady', () => {
  it('нужны incomingWebhook=yes и пустой webhookUrl', () => {
    expect(notificationsReady({ incomingWebhook: 'yes', webhookUrl: '' })).toBe(true)
    expect(notificationsReady({ incomingWebhook: 'no', webhookUrl: '' })).toBe(false)
    expect(notificationsReady({ incomingWebhook: 'yes', webhookUrl: 'https://x.y' })).toBe(false)
  })
})
